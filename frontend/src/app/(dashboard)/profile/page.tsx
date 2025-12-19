"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleAPIError } from "@/lib/api";
import {
  User,
  Mail,
  Shield,
  Hash,
  Save,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Page = () => {
  const { user, loadUser, updateUser, isLoading,ChangePassword } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
  });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    const init = async () => {
      await loadUser();
      setLoading(false);
    };
    init();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(handleAPIError(error));
    }
  };

  const handleChangePassword = async () => {
    if (
      !passwordData.old_password ||
      !passwordData.new_password ||
      !passwordData.confirm_password
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    try {
      await ChangePassword(passwordData);
        toast.success("Password changed successfully");
        setPasswordDialogOpen(false);
        setPasswordData({
            old_password: "",
            new_password: "",
            confirm_password: "",
        });
    } catch (error) {
      toast.error(handleAPIError(error));
    } finally {
      setChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <Shield className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Not Authenticated</h3>
              <p className="text-sm text-muted-foreground">
                Please log in to view your profile
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        {/* Main Profile Card */}
        <Card className="shadow-lg border-2">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.username}
                  </CardTitle>
                  <CardDescription className="text-base">
                    @{user.username}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="px-3 py-1 text-sm font-medium"
              >
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                {user.role}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* READ-ONLY SECTION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Account Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Hash className="h-3.5 w-3.5" />
                    User ID
                  </Label>
                  <Input
                    value={user.id}
                    disabled
                    className="bg-muted/50 font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    Role
                  </Label>
                  <Input
                    value={user.role}
                    disabled
                    className="bg-muted/50 capitalize"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    Email Address
                  </Label>
                  <Input value={user.email} disabled className="bg-muted/50" />
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* EDITABLE SECTION */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Editable Information
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter username"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-medium">
                      First Name
                    </Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="transition-all focus:ring-2 focus:ring-primary/20"
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="transition-all focus:ring-2 focus:ring-primary/20"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="min-w-[140px] shadow-md hover:shadow-lg transition-all"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator className="my-6" />

            {/* SECURITY SECTION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Security
                </h3>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">Password</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Change your password to keep your account secure
                  </p>
                </div>

                <Dialog
                  open={passwordDialogOpen}
                  onOpenChange={setPasswordDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new one
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="old_password">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="old_password"
                            name="old_password"
                            type={showPasswords.old ? "text" : "password"}
                            value={passwordData.old_password}
                            onChange={handlePasswordChange}
                            placeholder="Enter current password"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility("old")}
                          >
                            {showPasswords.old ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new_password">New Password</Label>
                        <div className="relative">
                          <Input
                            id="new_password"
                            name="new_password"
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            placeholder="Enter new password"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility("new")}
                          >
                            {showPasswords.new ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm_password">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirm_password"
                            name="confirm_password"
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirm_password}
                            onChange={handlePasswordChange}
                            placeholder="Confirm new password"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility("confirm")}
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-xs text-muted-foreground">
                          Password must be at least 8 characters long
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPasswordDialogOpen(false);
                          setPasswordData({
                            old_password: "",
                            new_password: "",
                            confirm_password: "",
                          });
                        }}
                        disabled={changingPassword}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleChangePassword}
                        disabled={changingPassword}
                      >
                        {changingPassword ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Changing...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Your profile information is securely stored and encrypted</p>
        </div>
      </div>
    </div>
  );
};

export default Page;
