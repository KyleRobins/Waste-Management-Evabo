"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentActivity } from "@/lib/hooks/use-recent-activity";
import { formatDistanceToNow } from "date-fns";

export function RecentActivity() {
  const { activities, loading } = useRecentActivity(3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Recent activities in the waste management system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center mb-4 space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="space-y-8">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center">
                <div className="flex items-center justify-center h-9 w-9 rounded-full bg-muted mr-4">
                  <span className="text-sm font-medium">
                    {activity.user.initials}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.user.name} {activity.action} {activity.details}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
