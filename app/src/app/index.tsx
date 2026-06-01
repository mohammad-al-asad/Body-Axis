import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function IndexRedirect() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const firstTime = useSelector((state: RootState) => state.settings.firstTime);
  console.log("isAuthenticated", isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tab)" />;
  }

  if (firstTime) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
