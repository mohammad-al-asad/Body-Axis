# BodyAxis EC2 Docker + Nginx Deployment

This deploys:

- `api.jointhebodyinstitute.com` to the FastAPI backend
- `admin.jointhebodyinstitute.com` to the Vite dashboard

Docker runs the API and dashboard. Nginx runs on the EC2 host as the public reverse proxy, and Certbot manages HTTPS certificates.

## 1. EC2 and DNS

Create or use an Ubuntu EC2 instance with an Elastic IP.

Security group inbound rules:

- SSH `22` from your IP only
- HTTP `80` from anywhere
- HTTPS `443` from anywhere

In GoDaddy DNS, add:

```txt
A api   EC2_ELASTIC_IP
A admin EC2_ELASTIC_IP
```

Wait until both records resolve to the EC2 Elastic IP.

## 2. Connect With VS Code Remote SSH

Install the VS Code extension named `Remote - SSH`.

Add an SSH host on your local machine:

```sshconfig
Host bodyaxis-ec2
  HostName EC2_ELASTIC_IP
  User ubuntu
  IdentityFile ~/.ssh/your-key.pem
```

In VS Code, run `Remote-SSH: Connect to Host...`, choose `bodyaxis-ec2`, and open the server folder where you want the project.

## 3. Install Docker on EC2

Run these commands in the VS Code remote terminal:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu
```

Disconnect and reconnect VS Code Remote SSH so the Docker group permission applies.

Verify:

```bash
docker --version
docker compose version
```

## 4. Install Nginx and Certbot

Run:

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 5. Clone or Upload the Repo

Recommended location:

```bash
sudo mkdir -p /opt/bodyaxis
sudo chown -R ubuntu:ubuntu /opt/bodyaxis
git clone https://github.com/mohammad-al-asad/Body-Axis.git /opt/bodyaxis
cd /opt/bodyaxis
```

If the repository is private, use a GitHub deploy key or authenticate GitHub on the server.

## 6. Create Production Env Files

Create the Docker Compose env file:

```bash
cp deploy/compose.env.example deploy/compose.env
nano deploy/compose.env
```

Example:

```env
DASHBOARD_API_URL=https://api.jointhebodyinstitute.com/api/v1
```

Create the API env file:

```bash
cp deploy/api.env.example deploy/api.env
nano deploy/api.env
```

Generate a strong API secret:

```bash
openssl rand -hex 32
```

Set at least:

```env
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_generated_secret
ADMIN_BOOTSTRAP_EMAIL=first_admin_email
ADMIN_BOOTSTRAP_PASSWORD=temporary_strong_password
CORS_ORIGINS=https://admin.jointhebodyinstitute.com
```

If MongoDB Atlas is used, add the EC2 Elastic IP to Atlas Network Access.

If S3 uploads are used, prefer assigning an IAM role to the EC2 instance. If you use explicit AWS keys instead, add them to `deploy/api.env`.

If video uploads use browser-to-S3 multipart upload, configure bucket CORS too. A minimal example:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": ["https://admin.jointhebodyinstitute.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

Lock down the env files:

```bash
chmod 600 deploy/*.env
```

## 7. Start Docker Services

From the repo root:

```bash
docker compose --env-file deploy/compose.env -f docker-compose.prod.yml up -d --build
```

Watch logs:

```bash
docker compose --env-file deploy/compose.env -f docker-compose.prod.yml logs -f
```

Check containers:

```bash
docker compose --env-file deploy/compose.env -f docker-compose.prod.yml ps
```

The API container is available only on the EC2 host at `127.0.0.1:8000`.

The dashboard container is available only on the EC2 host at `127.0.0.1:8080`.

## 8. Configure Nginx

Copy the included Nginx config:

```bash
sudo cp deploy/nginx/bodyaxis.conf /etc/nginx/sites-available/bodyaxis
sudo ln -sf /etc/nginx/sites-available/bodyaxis /etc/nginx/sites-enabled/bodyaxis
sudo nginx -t
sudo systemctl reload nginx
```

Check HTTP before adding SSL:

```bash
curl http://api.jointhebodyinstitute.com/health
curl http://admin.jointhebodyinstitute.com
```

## 9. Add HTTPS With Certbot

Only run this after GoDaddy DNS points both subdomains to the EC2 Elastic IP:

```bash
sudo certbot --nginx -d api.jointhebodyinstitute.com -d admin.jointhebodyinstitute.com
```

Choose the option to redirect HTTP to HTTPS.

Test renewal:

```bash
sudo certbot renew --dry-run
```

## 10. Verify

Open:

```txt
https://api.jointhebodyinstitute.com/health
https://api.jointhebodyinstitute.com/api/v1/health
https://admin.jointhebodyinstitute.com
```

Then log in with the bootstrap admin email and password.

After the first admin login, remove `ADMIN_BOOTSTRAP_PASSWORD` from `deploy/api.env` and restart:

```bash
docker compose --env-file deploy/compose.env -f docker-compose.prod.yml up -d --build api
```

## 11. RevenueCat Webhook

Set the RevenueCat webhook URL to:

```txt
https://api.jointhebodyinstitute.com/api/v1/revenuecat/webhook
```

The webhook authorization value must match `REVENUECAT_WEBHOOK_AUTH`.

## 12. Future Deploys

Pull the latest code and rebuild:

```bash
cd /opt/bodyaxis
git pull
docker compose --env-file deploy/compose.env -f docker-compose.prod.yml up -d --build
```

If you only changed env values:

```bash
docker compose --env-file deploy/compose.env -f docker-compose.prod.yml up -d
```

Reload Nginx after proxy config changes:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 13. Useful Commands

API logs:

```bash
docker compose --env-file deploy/compose.env -f docker-compose.prod.yml logs -f api
```

Dashboard logs:

```bash
docker compose --env-file deploy/compose.env -f docker-compose.prod.yml logs -f admin
```

Restart API:

```bash
docker compose --env-file deploy/compose.env -f docker-compose.prod.yml restart api
```

Stop everything:

```bash
docker compose --env-file deploy/compose.env -f docker-compose.prod.yml down
```

## 14. GitHub Actions CI/CD

This repository now includes a workflow at `.github/workflows/ec2-deploy.yml`.

What it does:

- On pull requests to `main`, it runs API CI and dashboard CI
- On pushes to `main`, it runs the same CI checks and then deploys to EC2 over SSH
- It reuses the existing Docker Compose deployment on the server

### Create A GitHub Environment

In GitHub, create an environment named `production`.

Recommended protections:

- Restrict deployments to the `main` branch
- Require manual approval if you want a release gate before production deploys

### Add These GitHub Secrets

Prefer adding these as `production` environment secrets instead of plain repository secrets:

```txt
EC2_HOST=your_server_public_ip_or_dns
EC2_PORT=22
EC2_USER=ubuntu
EC2_APP_PATH=/opt/bodyaxis
EC2_SSH_KEY=the_full_private_key_contents
```

`EC2_SSH_KEY` should be the private key that matches the public key in `~/.ssh/authorized_keys` for the EC2 user.

### Server Prerequisites For CI/CD

Before the workflow can deploy successfully, the EC2 instance still needs the one-time setup from earlier sections:

- Docker and Docker Compose plugin installed
- Nginx and Certbot installed
- Repository cloned into `/opt/bodyaxis`
- `deploy/compose.env` created
- `deploy/api.env` created

The deploy job runs this script on the server:

```bash
./deploy/scripts/deploy-ec2.sh
```

That script:

- Pulls the latest code
- Rebuilds the API and dashboard containers
- Restarts them with Docker Compose
- Verifies `http://127.0.0.1:8000/health`
- Verifies `http://127.0.0.1:8080/`

### First-Time SSH Setup Check

From your own machine, confirm the GitHub Actions user/key can reach the server by testing the same key manually:

```bash
ssh -i ~/.ssh/your-key.pem ubuntu@EC2_ELASTIC_IP
```

### Triggering Deploys

Deploy happens automatically when a commit touching the API, dashboard, deploy config, or production workflow is pushed to `main`.

You can also run the workflow manually from the GitHub Actions tab with `workflow_dispatch`.
