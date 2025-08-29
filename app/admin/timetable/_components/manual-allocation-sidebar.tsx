"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { User, Building2, Plus, Minus, Zap, Clock, Users, BookOpen, Settings } from "lucide-react"
import type { FullScheduledEvent, ActiveTimeSlot, AvailablePersonnel, AvailableRoom } from "./_utils"
import { updateScheduledEventResources } from "@/lib/actions"

interface ManualAllocationSidebarProps {
  activeTimeSlot: ActiveTimeSlot
  eventsAtTimeSlot: FullScheduledEvent[]
  freeResourcesAtTimeSlot: {
    availablePersonnel: AvailablePersonnel[]
    availableRooms: AvailableRoom[]
  }
  selectedEventToAssign: FullScheduledEvent | null
  onSelectEventToAssign: (event: FullScheduledEvent | null) => void
  onEventUpdate: (updatedEvent: FullScheduledEvent) => void
  onRefreshData: () => void
  scheduleInstanceId: string
}

export function ManualAllocationSidebar({
  activeTimeSlot,
  eventsAtTimeSlot,
  freeResourcesAtTimeSlot,
  selectedEventToAssign,
  onSelectEventToAssign,
  onEventUpdate,
  onRefreshData,
  scheduleInstanceId,
}: ManualAllocationSidebarProps) {
  const [isRunningSimpleSolver, setIsRunningSimpleSolver] = useState(false)

  const handleAssignResource = async (resourceId: string, resourceType: "personnel" | "room") => {
    if (!selectedEventToAssign) {
      toast.error("Please select an event first")
      return
    }

    let result
    if (resourceType === "room") {
      result = await updateScheduledEventResources({
        scheduledEventId: selectedEventToAssign.id,
        roomId: resourceId,
      })
    } else {
      const currentPersonnelIds = selectedEventToAssign.personnelIds || []
      const newPersonnelIds = [...new Set([...currentPersonnelIds, resourceId])]
      result = await updateScheduledEventResources({
        scheduledEventId: selectedEventToAssign.id,
        personnelIds: newPersonnelIds,
      })
    }

    if (result?.success && result.data) {
      toast.success(`${resourceType === "room" ? "Room" : "Personnel"} assigned successfully!`)
      onEventUpdate(result.data as FullScheduledEvent)
      onRefreshData()
    } else {
      toast.error(result?.message || `Failed to assign ${resourceType}`)
    }
  }

  const handleRemoveResource = async (resourceId: string, resourceType: "personnel" | "room") => {
    if (!selectedEventToAssign) return

    let result
    if (resourceType === "room") {
      result = await updateScheduledEventResources({
        scheduledEventId: selectedEventToAssign.id,
        roomId: null,
      })
    } else {
      const updatedPersonnelIds = selectedEventToAssign.personnelIds.filter((id) => id !== resourceId)
      result = await updateScheduledEventResources({
        scheduledEventId: selectedEventToAssign.id,
        personnelIds: updatedPersonnelIds,
      })
    }

    if (result?.success && result.data) {
      toast.success(`${resourceType === "room" ? "Room" : "Personnel"} removed successfully!`)
      onEventUpdate(result.data as FullScheduledEvent)
      onRefreshData()
    } else {
      toast.error(result?.message || `Failed to remove ${resourceType}`)
    }
  }

  const handleRunSimpleSolver = async () => {
    if (!activeTimeSlot) {
      toast.error("Please select a time slot first")
      return
    }

    setIsRunningSimpleSolver(true)
    try {
      const response = await fetch(`/api/schedules/${scheduleInstanceId}/simple-solver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: activeTimeSlot.dayOfWeek,
          startTime: activeTimeSlot.startTime,
          endTime: activeTimeSlot.endTime,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success("Simple allocation completed!")
        onRefreshData()
      } else {
        throw new Error("Failed to run simple solver")
      }
    } catch (error) {
      toast.error("Failed to run simple allocation")
    } finally {
      setIsRunningSimpleSolver(false)
    }
  }

  if (!activeTimeSlot) {
    return (
      <div className="space-y-6">
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Select a Time Slot</h3>
            <p className="text-sm text-muted-foreground">
              Click on a time slot in the timetable to view and manage assignments
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Slot Header */}
      <Card className="shadow-lg rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            {activeTimeSlot.dayOfWeek}, {activeTimeSlot.startTime}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {eventsAtTimeSlot.length} Event{eventsAtTimeSlot.length !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="secondary">
              {freeResourcesAtTimeSlot.availablePersonnel.length + freeResourcesAtTimeSlot.availableRooms.length}{" "}
              Available
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            onClick={handleRunSimpleSolver}
            disabled={isRunningSimpleSolver}
            className="w-full bg-transparent"
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isRunningSimpleSolver ? "Running..." : "Run Simple Solver"}
          </Button>
        </CardContent>
      </Card>

      {/* Events and Resources Tabs */}
      <Card className="shadow-lg rounded-xl">
        <Tabs defaultValue="events" className="w-full">
          <CardHeader className="pb-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="events" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Resources
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="events" className="mt-0 space-y-4">
              {eventsAtTimeSlot.length > 0 ? (
                eventsAtTimeSlot.map((event) => (
                  <Card
                    key={event.id}
                    className={`cursor-pointer transition-all ${
                      selectedEventToAssign?.id === event.id ? "ring-2 ring-primary border-primary" : "hover:shadow-md"
                    }`}
                    onClick={() => onSelectEventToAssign(selectedEventToAssign?.id === event.id ? null : event)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold">{event.activityTemplate.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {event.attendeeSection?.name || event.attendeeGroup?.name}
                          </p>
                        </div>

                        {/* Current Assignments */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {event.room ? (
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-sm">{event.room.name}</span>
                                {selectedEventToAssign?.id === event.id && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveResource(event.room!.id, "room")
                                    }}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground italic">No room assigned</span>
                            )}
                          </div>

                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              {event.personnel.length > 0 ? (
                                <div className="space-y-1">
                                  {event.personnel.map((person) => (
                                    <div key={person.id} className="flex items-center gap-2">
                                      <span className="text-sm">{person.name}</span>
                                      <div className="flex gap-1">
                                        {person.roles.map((role) => (
                                          <Badge key={role} variant="secondary" className="text-xs">
                                            {role}
                                          </Badge>
                                        ))}
                                      </div>
                                      {selectedEventToAssign?.id === event.id && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleRemoveResource(person.id, "personnel")
                                          }}
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground italic">No personnel assigned</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {selectedEventToAssign?.id === event.id && (
                          <Badge className="w-fit">Selected for Assignment</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No events at this time slot</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="resources" className="mt-0">
              <Tabs defaultValue="personnel" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="personnel">Personnel</TabsTrigger>
                  <TabsTrigger value="rooms">Rooms</TabsTrigger>
                </TabsList>

                <TabsContent value="personnel" className="space-y-3 mt-4">
                  {freeResourcesAtTimeSlot.availablePersonnel.length > 0 ? (
                    freeResourcesAtTimeSlot.availablePersonnel.map((person) => (
                      <Card key={person.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <h5 className="font-medium">{person.name}</h5>
                                <div className="flex gap-1 mt-1">
                                  {person.roles.map((role) => (
                                    <Badge key={role} variant="secondary" className="text-xs">
                                      {role}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!selectedEventToAssign}
                              onClick={() => handleAssignResource(person.id, "personnel")}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Assign
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No personnel available</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="rooms" className="space-y-3 mt-4">
                  {freeResourcesAtTimeSlot.availableRooms.length > 0 ? (
                    freeResourcesAtTimeSlot.availableRooms.map((room) => (
                      <Card key={room.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <h5 className="font-medium">{room.name}</h5>
                                <p className="text-sm text-muted-foreground">
                                  {room.building} • {room.type} • Cap: {room.capacity}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!selectedEventToAssign}
                              onClick={() => handleAssignResource(room.id, "room")}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Assign
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No rooms available</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {!selectedEventToAssign && (
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-6 text-center">
            <Settings className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Select an event above to assign resources</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
