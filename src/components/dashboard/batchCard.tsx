import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BatchCardProps {
  batch: {
    name: string;
    inviteCode: string;
    isArchived: boolean;
  };
  onUpdate: () => void;
}

export default function BatchCard({ batch, onUpdate }: BatchCardProps) {
  return (
    <Card
      className={`relative min-w-[300px] max-w-full ${
        batch.isArchived ? "bg-muted/50 border-dashed" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle
          className={`text-xl font-bold truncate max-w-full ${
            batch.isArchived ? "text-muted-foreground" : ""
          }`}
        >
          {batch.name}
          {batch.isArchived && (
            <span className="ml-2 text-sm text-muted-foreground">
              (Archived)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Invite Code:{" "}
          <span className="font-mono font-medium text-foreground">
            {batch.inviteCode}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
