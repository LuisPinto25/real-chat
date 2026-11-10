'use client';

import { useState, useEffect, useMemo } from 'react';
import type { User } from '@/types';
import { getUsersAction } from '@/actions/users';

export function useUsers(enabled: boolean = true) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!enabled) {
      setSearch('');
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    getUsersAction()
      .then((data) => {
        if (isMounted) setUsers(data);
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const query = search.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query),
    );
  }, [users, search]);

  return {
    users,
    filteredUsers,
    isLoading,
    search,
    setSearch,
  };
}
