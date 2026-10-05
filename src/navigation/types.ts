import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

/** Preset filters for the product list (from home, categories, brands, search). */
export interface ProductFilterParams {
  category?: string;
  brand?: string;
  keyword?: string;
  title?: string;
}

export type CustomerTabParamList = {
  Home: undefined;
  Shop: ProductFilterParams | undefined;
  Cart: undefined;
  Wishlist: undefined;
  Account: undefined;
};

export type StaffTabParamList = {
  Overview: undefined;
  StaffOrders: { delivered?: 'true' | 'false' } | undefined;
  StaffProducts: undefined;
  Manage: undefined;
  Account: undefined;
};

/** One root stack; which screens exist depends on the session (guest / shopper / staff). */
export type RootStackParamList = {
  // storefront (guests + shoppers)
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList> | undefined;
  ProductDetails: { id: string };
  Products: ProductFilterParams | undefined;
  Categories: undefined;
  Category: { id: string; name?: string };
  Brands: undefined;
  Stores: undefined;
  Blog: undefined;
  BlogPost: { slug: string };
  // auth (guests only, presented modally)
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  // shopper account
  Checkout: undefined;
  Orders: undefined;
  OrderDetails: { id: string; placed?: boolean };
  Addresses: undefined;
  AddressForm: { addressId?: string } | undefined;
  MyReviews: undefined;
  // any signed-in user
  EditProfile: undefined;
  ChangePassword: undefined;
  // staff (admin / manager)
  StaffTabs: NavigatorScreenParams<StaffTabParamList> | undefined;
  StaffOrderDetail: { id: string };
  ProductForm: { id?: string } | undefined;
  StaffCategories: undefined;
  CategoryForm: { id?: string } | undefined;
  StaffSubcategories: undefined;
  SubcategoryForm: { id?: string; category?: string } | undefined;
  StaffBrands: undefined;
  BrandForm: { id?: string } | undefined;
  StaffCoupons: undefined;
  CouponForm: { id?: string } | undefined;
  StaffBranches: undefined;
  BranchForm: { id?: string } | undefined;
  StaffUsers: undefined;
  UserForm: { id?: string } | undefined;
  UserPassword: { id: string };
  StaffReviews: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
export type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export type CustomerTabScreenProps<T extends keyof CustomerTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<CustomerTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
export type StaffTabScreenProps<T extends keyof StaffTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<StaffTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
