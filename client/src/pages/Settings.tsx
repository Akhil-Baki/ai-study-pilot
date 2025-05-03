
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Settings as SettingsIcon, User, Bell, Clock, Shield, Moon, Sun, Volume2 } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [defaultStudyDuration, setDefaultStudyDuration] = useState(25);
  const [soundVolume, setSoundVolume] = useState(70);
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="flex flex-col space-y-1">
                  <button
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      activeTab === "account" ? "bg-gray-100" : ""
                    }`}
                    onClick={() => setActiveTab("account")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </button>
                  <button
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      activeTab === "notifications" ? "bg-gray-100" : ""
                    }`}
                    onClick={() => setActiveTab("notifications")}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </button>
                  <button
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      activeTab === "study" ? "bg-gray-100" : ""
                    }`}
                    onClick={() => setActiveTab("study")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Study Preferences
                  </button>
                  <button
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      activeTab === "appearance" ? "bg-gray-100" : ""
                    }`}
                    onClick={() => setActiveTab("appearance")}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Appearance
                  </button>
                  <button
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      activeTab === "privacy" ? "bg-gray-100" : ""
                    }`}
                    onClick={() => setActiveTab("privacy")}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Privacy
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "account" ? "Account Settings" :
                   activeTab === "notifications" ? "Notification Settings" :
                   activeTab === "study" ? "Study Preferences" :
                   activeTab === "appearance" ? "Appearance" : "Privacy Settings"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "account" ? "Manage your account information" :
                   activeTab === "notifications" ? "Configure how you receive notifications" :
                   activeTab === "study" ? "Configure your study environment" :
                   activeTab === "appearance" ? "Customize the look and feel" : "Manage your privacy settings"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {activeTab === "account" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" defaultValue="Emily Cooper" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue="emily@example.com" type="email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="academicLevel">Academic Level</Label>
                      <Select defaultValue="undergraduate">
                        <SelectTrigger id="academicLevel">
                          <SelectValue placeholder="Select your academic level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="highschool">High School</SelectItem>
                          <SelectItem value="undergraduate">Undergraduate</SelectItem>
                          <SelectItem value="graduate">Graduate</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications about your study plans via email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="studyReminders">Study Reminders</Label>
                        <p className="text-sm text-gray-500">Receive reminders before scheduled study sessions</p>
                      </div>
                      <Switch
                        id="studyReminders"
                        checked={studyReminders}
                        onCheckedChange={setStudyReminders}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reminderTime">Reminder Time</Label>
                      <Select defaultValue="30">
                        <SelectTrigger id="reminderTime">
                          <SelectValue placeholder="Select reminder time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 minutes before</SelectItem>
                          <SelectItem value="15">15 minutes before</SelectItem>
                          <SelectItem value="30">30 minutes before</SelectItem>
                          <SelectItem value="60">1 hour before</SelectItem>
                          <SelectItem value="120">2 hours before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {activeTab === "study" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="studyDuration">Default Study Session Duration</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="studyDuration"
                          min={5}
                          max={120}
                          step={5}
                          value={[defaultStudyDuration]}
                          onValueChange={(value) => setDefaultStudyDuration(value[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-center">{defaultStudyDuration} min</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="soundVolume">Sound Volume</Label>
                      <div className="flex items-center space-x-2">
                        <Volume2 className="h-4 w-4 text-gray-500" />
                        <Slider
                          id="soundVolume"
                          min={0}
                          max={100}
                          value={[soundVolume]}
                          onValueChange={(value) => setSoundVolume(value[0])}
                          className="flex-1"
                        />
                        <span className="w-8 text-center">{soundVolume}%</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="defaultSound">Default Ambient Sound</Label>
                      <Select defaultValue="white-noise">
                        <SelectTrigger id="defaultSound">
                          <SelectValue placeholder="Select default sound" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="white-noise">White Noise</SelectItem>
                          <SelectItem value="nature">Nature Sounds</SelectItem>
                          <SelectItem value="rain">Rain</SelectItem>
                          <SelectItem value="cafe">Cafe Ambience</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {activeTab === "appearance" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Moon className="h-4 w-4 mr-2 text-gray-500" />
                          <Label htmlFor="darkMode">Dark Mode</Label>
                        </div>
                        <p className="text-sm text-gray-500">Switch to dark theme for studying at night</p>
                      </div>
                      <Switch
                        id="darkMode"
                        checked={darkMode}
                        onCheckedChange={setDarkMode}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="colorTheme">Color Theme</Label>
                      <Select defaultValue="blue">
                        <SelectTrigger id="colorTheme">
                          <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="purple">Purple</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fontSize">Font Size</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger id="fontSize">
                          <SelectValue placeholder="Select font size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="x-large">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {activeTab === "privacy" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dataCollection">Data Collection</Label>
                        <p className="text-sm text-gray-500">Allow anonymous usage data collection to improve the app</p>
                      </div>
                      <Switch
                        id="dataCollection"
                        defaultChecked={true}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="dataRetention">Data Retention</Label>
                      <Select defaultValue="6-months">
                        <SelectTrigger id="dataRetention">
                          <SelectValue placeholder="Select data retention period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-month">1 Month</SelectItem>
                          <SelectItem value="3-months">3 Months</SelectItem>
                          <SelectItem value="6-months">6 Months</SelectItem>
                          <SelectItem value="1-year">1 Year</SelectItem>
                          <SelectItem value="indefinite">Indefinite</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        How long to retain your study data and history
                      </p>
                    </div>

                    <div className="pt-4">
                      <Button variant="destructive" size="sm">
                        Delete All My Data
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        This action permanently removes all your data from our servers
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveSettings}>Save Settings</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
