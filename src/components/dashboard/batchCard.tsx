import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Archive, Trash2, ArchiveX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface BatchCardProps {
  batch: {
    name: string;
    inviteCode: string;
    isArchived: boolean;
  };
  onUpdate: () => void;
}

export default function BatchCard({ batch, onUpdate }: BatchCardProps) {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newName, setNewName] = useState(batch.name);
  const [captcha, setCaptcha] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleRename = async () => {
    try {
      const response = await axios.patch("/api/batches/renamebatch", {
        batchName: batch.name,
        newName: newName,
      });
      toast.success("Batch renamed successfully");
      setIsRenameDialogOpen(false);
      setDropdownOpen(false);
      onUpdate();
    } catch (error) {
      console.log(error);
      toast.error("Failed to rename batch");
    }
  };

  const handleArchive = async () => {
    try {
      const response = await axios.patch("/api/batches/archivebatch", {
        data: { batchName: batch.name },
      });
      toast.success("Batch archived successfully");
      setDropdownOpen(false);
      onUpdate();
    } catch (error) {
      console.log(error);
      toast.error("Failed to archive batch");
    }
  };

  const handleUnarchive = async () => {
    try {
      const response = await axios.patch("/api/batches/unarchivebatch", {
        data: { batchName: batch.name },
      });
      toast.success("Batch unarchived successfully");
      setDropdownOpen(false);
      onUpdate();
    } catch (error) {
      console.log(error);
      toast.error("Failed to unarchive batch");
    }
  };

  const handleDelete = async () => {
    if (captcha !== "DELETE") {
      toast.error("Please enter the correct captcha");
      return;
    }
    try {
      const response = await axios.delete("/api/batches/deletebatch", {
        data: { batchName: batch.name },
      });
      toast.success("Batch deleted successfully");
      setIsDeleteDialogOpen(false);
      setDropdownOpen(false);
      onUpdate();
    } catch (error) {
      toast.error("Failed to delete batch");
    }
  };

  return (
    <Card
      className={`relative min-w-[300px] max-w-full ${
        batch.isArchived ? "bg-muted/50 border-dashed" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle
          className={`text-xl font-bold truncate max-w-[calc(100%-3rem)] ${
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
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!batch.isArchived && (
              <>
                <Dialog
                  open={isRenameDialogOpen}
                  onOpenChange={setIsRenameDialogOpen}
                >
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rename Batch</DialogTitle>
                      <DialogDescription>
                        Enter a new name for the batch.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleRename}>Save Changes</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              </>
            )}
            {batch.isArchived && (
              <DropdownMenuItem onClick={handleUnarchive}>
                <ArchiveX className="mr-2 h-4 w-4" />
                Unarchive
              </DropdownMenuItem>
            )}
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Batch</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. Please type "DELETE" to
                    confirm.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="captcha">Confirmation</Label>
                    <Input
                      id="captcha"
                      value={captcha}
                      onChange={(e) => setCaptcha(e.target.value)}
                      placeholder="Type DELETE to confirm"
                    />
                  </div>
                  <Button onClick={handleDelete} variant="destructive">
                    Delete Batch
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
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
