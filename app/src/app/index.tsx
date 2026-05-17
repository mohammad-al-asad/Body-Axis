import { Redirect } from 'expo-router';

export default function IndexRedirect() {
  const  isAuthenticated  = false

  if (isAuthenticated) {
    return <Redirect href="/(tab)" />;
  }
  return <Redirect href="/(onboarding)" />;
}
