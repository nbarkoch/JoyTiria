import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Announcement, Group} from './utils/store';

export type RootStackParamList = {
  Home: {email: string};
  Register: undefined;
  Login: undefined;
};

export type TabsStackParamList = {
  Announcements: {announcements: Announcement[]};
  Groups: {groups: Group[]};
  Profile: {userId: string};
};

export type GroupStackParamList = {
  GroupInfo: {groupId: string};
  GroupsOverview: {groups: Group[]};
};

export type ProfileScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export type TabsNavigationProp = NativeStackNavigationProp<TabsStackParamList>;

export type GroupsScreenNavigationProp =
  NativeStackNavigationProp<GroupStackParamList>;
