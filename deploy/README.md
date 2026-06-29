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
git clone YOUR_REPO_URL /opt/bodyaxis
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
