import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../i18n';
import { AddressFormScreen, AddressesScreen } from '../screens/AddressesScreen';
import { BlogPostScreen, BlogScreen } from '../screens/BlogScreens';
import { BrandsScreen,CategoriesScreen, CategoryScreen } from '../screens/CatalogScreens';
import { ChangePasswordScreen, EditProfileScreen } from '../screens/ProfileScreens';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { ForgotPasswordScreen, LoginScreen, SignupScreen } from '../screens/AuthScreens';
import { MyReviewsScreen } from '../screens/MyReviewsScreen';
import { OrderDetailsScreen, OrdersScreen } from '../screens/OrdersScreens';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { StoresScreen } from '../screens/StoresScreen';
import { colors, fonts } from '../theme';
import { CustomerTabs } from './CustomerTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.cream, card: colors.white, text: colors.dark, border: colors.border }
};

/**
 * One stack for everyone; which screens exist depends on the session. Guests get the auth
 * modals, shoppers get checkout/orders/addresses. (Staff dashboard screens are not part of this build.)
 */
export function RootNavigator() {
  const { isAuthenticated, isShopper } = useAuth();
  const t = useT();
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.dark,
          headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 17 },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.cream }
        }}>
        <Stack.Screen name="CustomerTabs" component={CustomerTabs} options={{ headerShown: false }} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: '' }} />
        <Stack.Screen name="Products" component={ProductsScreen} options={{ title: t('Mobile.tabShop') }} />
        <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: t('Nav.categories') }} />
        <Stack.Screen name="Category" component={CategoryScreen} options={({ route }) => ({ title: route.params.name ?? t('Nav.categories') })} />
        <Stack.Screen name="Brands" component={BrandsScreen} options={{ title: t('Nav.brands') }} />
        <Stack.Screen name="Stores" component={StoresScreen} options={{ title: t('Nav.stores') }} />
        <Stack.Screen name="Blog" component={BlogScreen} options={{ title: t('BlogPage.breadcrumbBlog') }} />
        <Stack.Screen name="BlogPost" component={BlogPostScreen} options={{ title: '' }} />

        {!isAuthenticated && (
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('Nav.login') }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: t('Nav.signup') }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: t('Auth.forgotTitle') }} />
          </Stack.Group>
        )}

        {isAuthenticated && (
          <>
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: t('Account.profile') }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: t('Account.changePassword') }} />
          </>
        )}

        {isShopper && (
          <>
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: t('Checkout.title') }} />
            <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: t('Orders.title') }} />
            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: t('Orders.order') }} />
            <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: t('Account.addresses') }} />
            <Stack.Screen name="AddressForm" component={AddressFormScreen} options={{ title: t('Account.addAddress'), presentation: 'modal' }} />
            <Stack.Screen name="MyReviews" component={MyReviewsScreen} options={{ title: t('Account.reviews') }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
