import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import create from 'zustand';

export type DocRef =
  FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>;

export type Leader = {
  docRef: DocRef;
};

export type PendingScore = {
  score: number;
  expirationDate: FirebaseFirestoreTypes.Timestamp;
};

export type PendingScoreGroup = {
  score: number;
  groupId: string;
};

export type Player = {
  docRef: DocRef;
  score: number;
  pendingScoreGroup?: PendingScoreGroup | null;
};

export type Group = {
  id: string;
  leader?: Leader | null;
  name: string;
  players: Player[];
  scoreInBank?: PendingScore | null;
};

export type Announcement = {
  by: DocRef;
  date: FirebaseFirestoreTypes.Timestamp;
  message: string;
  selected?: boolean | null;
};

export type World = {
  admins: DocRef[];
  announcements: Announcement[];
  groups: Group[];
  isAdmin: boolean;
  pendingUsers?: Player[];
};

export type ImageType = {uri: string};

export type WorldHeader = {
  ref: DocRef;
  refData: DocRef;
  name: string;
  image?: ImageType;
};

export type User = {
  ref: DocRef;
  name: string;
  worlds: WorldHeader[];
  currentWorldRef?: DocRef;
  image?: ImageType;
};

export type UserPreview = {
  ref: DocRef;
  name: string;
  worlds?: WorldPreview[];
  image?: ImageType;
};

export type WorldPreview = {
  smallData: DocRef;
  bigData: DocRef;
};

interface UserState {
  user?: User;
  setNewUser: (user: User) => void;
  setUser: (user: User) => void;
  removeUser: () => void;
  setWorldRef: (worldRef: DocRef) => void;
  getCurrentWorldHeader: () => WorldHeader | undefined;
  selectedWorldHeader?: WorldHeader;
  setSelectedWorldHeader: (woldHeader: WorldHeader) => void;
}

export const useCurrentUser = create<UserState>((set, get) => ({
  user: undefined,
  setNewUser: newUser => set(() => ({user: newUser})),
  setUser: newUser =>
    set(state => {
      if (
        state.user?.currentWorldRef !== undefined &&
        newUser?.worlds !== undefined &&
        newUser.worlds.findIndex(
          worldH => worldH.refData.id === state.user?.currentWorldRef?.id,
        ) >= 0
      ) {
        return {
          user: {...newUser, currentWorldRef: state.user.currentWorldRef},
        };
      }
      return {user: newUser};
    }),
  removeUser: () => set({user: undefined}),
  setWorldRef: worldRef =>
    set(state =>
      state.user === undefined
        ? {user: undefined}
        : {user: {...state.user, currentWorldRef: worldRef}},
    ),
  getCurrentWorldHeader: () => {
    const state = get();
    const currentWorldHeader = state.user?.worlds.find(
      worldHeader => worldHeader.refData === state.user?.currentWorldRef,
    );
    return currentWorldHeader;
  },
  selectedWorldHeader: undefined,
  setSelectedWorldHeader: woldHeader =>
    set(state => {
      if (state.user !== undefined) {
        if (
          state.user.worlds.find(value => value.ref.id === woldHeader.ref.id)
        ) {
          return {
            selectedWorldHeader: woldHeader,
          };
        }
        return {
          selectedWorldHeader: state.selectedWorldHeader,
        };
      }
      return {selectedWorldHeader: undefined};
    }),
}));

interface WorldState {
  currentWorld?: World;
  setCurrentWorld: (world?: World) => void;
  removeCurrentWorld: () => void;
  getAllPlayers: () => Player[];
  getGroupById: (groupId: string) => Group | undefined;
}

export const useCurrentWorld = create<WorldState>((set, get) => ({
  currentWorld: undefined,
  setCurrentWorld: world => set(() => ({currentWorld: world})),
  removeCurrentWorld: () => set(() => ({currentWorld: undefined})),
  getAllPlayers: () => {
    return get().currentWorld?.groups.flatMap(grp => grp.players.flat()) ?? [];
  },
  getGroupById: groupId => {
    return get().currentWorld?.groups.find(grp => grp.id === groupId);
  },
}));

interface SelectionState {
  inProgress: boolean;
  setProgress: (b: boolean) => void;
  deleteActivated: boolean;
  setDeleteState: (b: boolean) => void;
}

export const useSelectionProgress = create<SelectionState>(set => ({
  inProgress: false,
  setProgress: b => set(() => ({inProgress: b})),
  deleteActivated: false,
  setDeleteState: b => set(() => ({deleteActivated: b})),
}));

interface SelectionPlayerState {
  selectedPlayer?: string;
  setSelectedPlayer: (id: string) => void;
  removeSelection: () => void;
}

export const useSelectionPlayerProgress = create<SelectionPlayerState>(set => ({
  selectedPlayer: undefined,
  setSelectedPlayer: p => set(() => ({selectedPlayer: p})),
  removeSelection: () => set(() => ({selectedPlayer: undefined})),
}));

export type Dialog = {
  title?: string;
  message: string;
  icon?: string;
  onSubmit?: () => void;
  onDecline?: () => void;
};

interface DialogState {
  dialog?: Dialog;
  setDialog: (dialog?: Dialog) => void;
}

export const useDialog = create<DialogState>(set => ({
  dialog: undefined,
  setDialog: dialog => set(() => ({dialog})),
}));

export type Snackbar = {
  text?: string;
  progress?: number;
};
interface SnackbarState {
  snackbar?: Snackbar;
  setSnackbar: (snackbar?: Snackbar) => void;
}

export const useSnackbar = create<SnackbarState>(set => ({
  snackbar: undefined,
  setSnackbar: snackbar => set(() => ({snackbar})),
}));

interface PendingUsersLayout {
  height: number;
  setHeight: (h: number) => void;
}

export const usePendingUsersLayout = create<PendingUsersLayout>(set => ({
  height: 0,
  setHeight: h => set(() => ({height: h})),
}));

interface GroupInfoState {
  groupId: string | undefined;
  groupName?: string;
  setGroupId: (id: string) => void;
  removeGroupId: () => void;
  setGroupName: (name?: string) => void;
}

export const useGroupInfo = create<GroupInfoState>(set => ({
  groupId: undefined,
  setGroupId: groupId => set(() => ({groupId: groupId})),
  setGroupName: name => set(() => ({groupName: name})),
  removeGroupId: () => set(() => ({groupId: undefined, groupName: undefined})),
}));

interface ProfileState {
  userProfileId?: string;
  setUserProfileId: (userId: string | undefined) => void;
}

export const useProfile = create<ProfileState>(set => ({
  userProfileId: undefined,
  setUserProfileId: userId =>
    set(state => ({userProfileId: userId ?? state.userProfileId})),
}));

interface KeyboardState {
  height?: number;
  setHeight: (h?: number) => void;
}

export const useKeyboard = create<KeyboardState>(set => ({
  height: undefined,
  setHeight: h => set(() => ({height: h})),
}));

export const clearStore = () => {
  useCurrentUser.setState(() => ({}));
  useCurrentWorld.setState(() => ({}));
  useSelectionProgress.setState(() => ({}));
  useSelectionPlayerProgress.setState(() => ({}));
  useGroupInfo.setState(() => ({}));
  useProfile.setState(() => ({}));
};
