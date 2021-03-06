import { useEffect } from "react";
import { useRouter } from "next/router";

import { useAuthState } from "../context/auth";
import { gql, hasuraUserClient } from "../lib/hasura-user-client";

const UpdateUserLastSeen = gql`
  mutation UpdateUserLastSeen($id: uuid!, $now: timestamptz!, $url: String) {
    update_users(
      where: { id: { _eq: $id } }
      _set: { last_seen: $now, last_seen_url: $url }
    ) {
      returning {
        last_seen
        last_seen_url
      }
    }
  }
`;

export default function LastSeen({ children }) {
  const router = useRouter();
  const { isAuthenticated, user, save_last_seen } = useAuthState();

  useEffect(() => {
    if (!isAuthenticated || !save_last_seen) return;

    // updateLastSeen(router.pathname);

    router.events.on("routeChangeComplete", updateLastSeen);

    return () => router.events.off("routeChangeComplete", updateLastSeen);
  }, [isAuthenticated, save_last_seen]);

  const updateLastSeen = async (url) => {
    const hasura = hasuraUserClient();

    await hasura.request(UpdateUserLastSeen, {
      id: user.id,
      now: new Date().toISOString(),
      url,
    });
  };

  return children;
}
