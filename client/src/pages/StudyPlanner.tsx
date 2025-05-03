import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Syllabus, StudyPlan, StudyPlanFormValues } from "@/types";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarView from "@/components/studyplanner/CalendarView";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle, ClipboardList } from "lucide-react";

// Form schema for creating a study plan
const studyPlanSchema = z.object({
  syllabusId: z.coerce.number().positive("Please select a syllabus"),
  startDate: z.date(),
  endDate: z.date(),
  preferences: z.object({
    hoursPerDay: z.coerce.number().min(0.5).max(12).optional(),
    preferredStudyTimes: z.array(z.string()).optional(),
    excludedDays: z.array(z.string()).optional(),
  }),
});

export default function StudyPlanner() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("create");
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);

  // Fetch syllabi for dropdown
  const { data: syllabi, isLoading: isLoadingSyllabi } = useQuery({
    queryKey: ["/api/syllabi"],
  });

  // Fetch existing study plans
  const { data: studyPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ["/api/study-plans"],
  });

  // Setup form
  const form = useForm<StudyPlanFormValues>({
    resolver: zodResolver(studyPlanSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
      preferences: {
        hoursPerDay: 2,
        preferredStudyTimes: [],
        excludedDays: [],
      },
    },
  });

  // Create study plan mutation
  const createMutation = useMutation({
    mutationFn: async (data: StudyPlanFormValues) => {
      return apiRequest("POST", "/api/study-plans", data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast.toast({
        title: "Success",
        description: "Your study plan has been created!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/study-plans"] });
      setActiveTab("view");
      setSelectedPlan(data);
    },
    onError: (error) => {
      toast.toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Failed to create study plan. Please try again.",
      });
    },
  });

  const onSubmit = (data: StudyPlanFormValues) => {
    createMutation.mutate(data);
  };

  const handleViewPlan = (plan: StudyPlan) => {
    setSelectedPlan(plan);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Study Planner</h1>
          <p className="mt-2 text-gray-600">
            Create AI-powered study plans based on your syllabi and preferences.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="create" className="flex items-center">
              <ClipboardList className="mr-2 h-4 w-4" />
              Create New Plan
            </TabsTrigger>
            <TabsTrigger value="view" className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              My Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Study Plan</CardTitle>
                <CardDescription>
                  Generate a customized study schedule based on your syllabus and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="syllabusId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Syllabus</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value?.toString()}
                            disabled={isLoadingSyllabi}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a syllabus" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingSyllabi ? (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              ) : syllabi?.length > 0 ? (
                                syllabi.map((syllabus: Syllabus) => (
                                  <SelectItem key={syllabus.id} value={syllabus.id.toString()}>
                                    {syllabus.title}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>
                                  No syllabi available. Upload one first.
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the syllabus to base your study plan on.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className="pl-3 text-left font-normal"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              When do you want to start studying?
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className="pl-3 text-left font-normal"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              When do you need to complete your studies?
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="preferences.hoursPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hours Per Day</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2"
                              {...field}
                              min={0.5}
                              max={12}
                              step={0.5}
                            />
                          </FormControl>
                          <FormDescription>
                            How many hours can you study per day on average?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createMutation.isPending || !syllabi?.length}
                    >
                      {createMutation.isPending ? "Generating..." : "Generate Study Plan"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view">
            {isLoadingPlans ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : studyPlans?.length > 0 ? (
              <div className="space-y-6">
                {selectedPlan ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>{selectedPlan.title}</CardTitle>
                            <CardDescription>
                              {format(new Date(selectedPlan.startDate), "PPP")} - {format(new Date(selectedPlan.endDate), "PPP")}
                            </CardDescription>
                          </div>
                          <Button variant="outline" onClick={() => setSelectedPlan(null)}>
                            Back to All Plans
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{selectedPlan.description}</p>
                        <CalendarView studyPlan={selectedPlan} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Study Sessions</CardTitle>
                        <CardDescription>
                          Your scheduled study sessions for this plan
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedPlan.sessions && selectedPlan.sessions.length > 0 ? (
                          <div className="space-y-4">
                            {selectedPlan.sessions.map((session) => (
                              <div key={session.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                                <div className="flex items-start space-x-4">
                                  <div className="flex-shrink-0 mt-1">
                                    {session.completed ? (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <h3 className="text-base font-medium text-gray-800">{session.title}</h3>
                                      <span className="text-xs text-gray-500">
                                        {format(new Date(session.date), "PPP")}
                                      </span>
                                    </div>
                                    {session.description && (
                                      <p className="text-sm text-gray-600 mb-2">{session.description}</p>
                                    )}
                                    <div className="flex items-center">
                                      <span className="text-xs bg-primary-100 text-primary-800 rounded-full px-2 py-0.5 mr-2">
                                        {session.duration} minutes
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">No study sessions found for this plan</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studyPlans.map((plan: StudyPlan) => (
                      <Card key={plan.id} className="hover:shadow-md transition-shadow duration-200">
                        <CardHeader>
                          <CardTitle>{plan.title}</CardTitle>
                          <CardDescription>
                            {format(new Date(plan.startDate), "PPP")} - {format(new Date(plan.endDate), "PPP")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 line-clamp-2">{plan.description}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            {plan.sessions?.length || 0} study sessions
                          </span>
                          <Button onClick={() => handleViewPlan(plan)}>View Plan</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No study plans yet</p>
                  <p className="text-gray-500 mb-4">Create your first study plan to get started</p>
                  <Button onClick={() => setActiveTab("create")}>Create Now</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
