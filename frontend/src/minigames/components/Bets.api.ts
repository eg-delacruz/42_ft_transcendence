type UpdateUserPointsResponse = {
  error: string;
  body: {
    _id: string;
    email: string;
    role: string;
    avatar_url?: string;
    display_name?: string;
    points: number;
  };
  message: string;
};

export async function updateUserPoints(
  userId: string,
  points: number,
): Promise<UpdateUserPointsResponse> {
  const response = await fetch(`/api/users/update/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ points }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'Error updating user points');
  }

  return data;
}

export async function updateManyUserPoints(
  updates: { userId: string; nextPoints: number }[],
): Promise<void> {
  await Promise.all(
    updates.map((update) =>
      updateUserPoints(update.userId, update.nextPoints),
    ),
  );
}