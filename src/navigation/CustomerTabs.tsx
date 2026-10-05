import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Heart, Home, ShoppingBag, Store, User } from 'lucide-react-native';
import { useCart } from '../hooks/useShop';
import { useT } from '../i18n';
import { AccountScreen } from '../screens/AccountScreen';
import { CartScreen } from '../screens/CartScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { colors, fonts } from '../theme';
import type { CustomerTabParamList } from './types';
import type { ComponentType } from 'react';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const icons: Record<keyof CustomerTabParamList, ComponentType<{ color: string; size: number }>> = {
  Home,
  Shop: Store,
  Cart: ShoppingBag,
  Wishlist: Heart,
  Account: User
};

export function CustomerTabs() {
  const t = useT('Mobile');
  const { count } = useCart();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => {
          const Icon = icons[route.name];
          return <Icon color={color} size={size} />;
        }
      })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('tabHome') }} />
      <Tab.Screen name="Shop" component={ProductsScreen} options={{ title: t('tabShop') }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: t('tabCart'), tabBarBadge: count > 0 ? count : undefined, tabBarBadgeStyle: { backgroundColor: colors.sale } }} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} options={{ title: t('tabWishlist') }} />
      <Tab.Screen name="Account" component={AccountScreen} options={{ title: t('tabAccount') }} />
    </Tab.Navigator>
  );
}
