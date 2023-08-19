import { useRouter } from 'next/router';
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
} from 'react';

type MakeContextParams<S, A> = {
  name?: string;
  initial: S | (() => S);
  reducer: (prevState: S, action: A) => S;
  initOnMounted?: (state: S, dispatch: Dispatch<A>) => Promise<boolean>;
};

export function makeContext<S, A>({
  initial,
  reducer,
  initOnMounted,
}: MakeContextParams<S, A>) {
  const Context = createContext<[state: S, dispatch: Dispatch<A>] | undefined>(
    undefined
  );

  function Provider({ children }: PropsWithChildren) {
    const [state, dispatch] = useReducer(
      reducer,
      initial instanceof Function ? initial() : initial
    );

    const router = useRouter();

    useEffect(() => {
      (async () => {
        const alreadyLogin = await initOnMounted?.(state, dispatch);

        if (alreadyLogin === false && router.asPath !== '/sign-in') {
          // router.replace('/sign-in');
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>
    );
  }

  function useStore() {
    const context = useContext(Context);

    if (context === undefined) {
      throw new Error(
        `context [${name}]: useStore hooks must be used within a Provider`
      );
    }

    return context;
  }

  return [Provider, useStore] as const;
}
