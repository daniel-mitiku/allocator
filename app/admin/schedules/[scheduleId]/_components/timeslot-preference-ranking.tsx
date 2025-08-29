"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { GripVertical, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TimeSlot {
  id: string
  day: string
  startTime: string
  endTime: string
  duration: number
}

interface TimeslotPreference {
  timeslotId: string
  rank: number
  resourceId: string
  resourceType: "PERSONNEL" | "ROOM"
}

interface TimeslotPreferenceRankingProps {
  resourceId: string
  resourceType: "PERSONNEL" | "ROOM"
  resourceName: string
  scheduleInstanceId: string
  availableTimeslots: TimeSlot[]
  existingPreferences: TimeslotPreference[]
  onPreferencesChange?: (preferences: TimeslotPreference[]) => void
}

export function TimeslotPreferenceRanking({
  resourceId,
  resourceType,
  resourceName,
  scheduleInstanceId,
  availableTimeslots,
  existingPreferences,
  onPreferencesChange,
}: TimeslotPreferenceRankingProps) {
  const [ranked, setRanked] = useState<TimeSlot[]>([])
  const [unranked, setUnranked] = useState<TimeSlot[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<string>("all")

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const groupedTimeslots = availableTimeslots.reduce(
    (acc, slot) => {
      if (!acc[slot.day]) acc[slot.day] = []
      acc[slot.day].push(slot)
      return acc
    },
    {} as Record<string, TimeSlot[]>,
  )

  useEffect(() => {
    const rankedIds = new Set(existingPreferences.map((p) => p.timeslotId))
    const sortedRanked = [...existingPreferences]
      .sort((a, b) => a.rank - b.rank)
      .map((p) => availableTimeslots.find((t) => t.id === p.timeslotId)!)
      .filter(Boolean)

    const initialUnranked = availableTimeslots.filter((t) => !rankedIds.has(t.id))

    setRanked(sortedRanked)
    setUnranked(initialUnranked)
  }, [availableTimeslots, existingPreferences])

  const filteredUnranked = selectedDay === "all" ? unranked : unranked.filter((slot) => slot.day === selectedDay)

  const filteredRanked = selectedDay === "all" ? ranked : ranked.filter((slot) => slot.day === selectedDay)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, slot: TimeSlot) => {
    setDraggedItemId(slot.id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropOnRanked = (e: React.DragEvent<HTMLDivElement>, dropIndex?: number) => {
    e.preventDefault()
    if (!draggedItemId) return

    const draggedSlot = ranked.find((s) => s.id === draggedItemId) || unranked.find((s) => s.id === draggedItemId)
    if (!draggedSlot) return

    const newRanked = ranked.filter((s) => s.id !== draggedItemId)
    const newUnranked = unranked.filter((s) => s.id !== draggedItemId)

    if (dropIndex !== undefined) {
      newRanked.splice(dropIndex, 0, draggedSlot)
    } else {
      newRanked.push(draggedSlot)
    }

    setRanked(newRanked)
    setUnranked(newUnranked)
    setDraggedItemId(null)
  }

  const handleDropOnUnranked = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!draggedItemId) return

    const draggedSlot = ranked.find((s) => s.id === draggedItemId)
    if (!draggedSlot) return

    setRanked(ranked.filter((s) => s.id !== draggedItemId))
    setUnranked([...unranked, draggedSlot])
    setDraggedItemId(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    const preferences: TimeslotPreference[] = ranked.map((slot, index) => ({
      timeslotId: slot.id,
      rank: index + 1,
      resourceId,
      resourceType,
    }))

    try {
      // Call API to save preferences
      const response = await fetch(`/api/schedules/${scheduleInstanceId}/timeslot-preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      })

      if (response.ok) {
        toast.success("Timeslot preferences saved successfully!")
        onPreferencesChange?.(preferences)
      } else {
        throw new Error("Failed to save preferences")
      }
    } catch (error) {
      toast.error("Failed to save timeslot preferences")
    } finally {
      setIsSaving(false)
    }
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Timeslot Preferences</h3>
          <p className="text-sm text-muted-foreground">Rank timeslots by preference for {resourceName}</p>
        </div>
        <Badge variant="outline">{resourceType === "PERSONNEL" ? "Personnel" : "Room"}</Badge>
      </div>

      <Tabs value={selectedDay} onValueChange={setSelectedDay}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Days</TabsTrigger>
          <TabsTrigger value="Monday">Mon-Wed</TabsTrigger>
          <TabsTrigger value="Thursday">Thu-Fri</TabsTrigger>
          <TabsTrigger value="Saturday">Weekend</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedDay} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ranked Timeslots */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Preferred Timeslots
                </CardTitle>
              </CardHeader>
              <CardContent onDragOver={handleDragOver} onDrop={(e) => handleDropOnRanked(e)} className="min-h-[300px]">
                {filteredRanked.length > 0 ? (
                  <div className="space-y-2">
                    {filteredRanked.map((slot, index) => (
                      <div
                        key={slot.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, slot)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnRanked(e, index)}
                        className="flex items-center p-3 border rounded-lg cursor-grab bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground mr-3" />
                        <div className="flex-grow">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{slot.day}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Drag timeslots here to rank them</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Timeslots */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Available Timeslots
                </CardTitle>
              </CardHeader>
              <CardContent onDragOver={handleDragOver} onDrop={handleDropOnUnranked} className="min-h-[300px]">
                {filteredUnranked.length > 0 ? (
                  <div className="space-y-2">
                    {filteredUnranked.map((slot) => (
                      <div
                        key={slot.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, slot)}
                        className="flex items-center p-3 border rounded-lg cursor-grab hover:bg-muted/50 transition-colors"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground mr-3" />
                        <div className="flex-grow">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{slot.day}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <p>No available timeslots for this filter</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center pt-4">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? "Saving..." : "Save Timeslot Preferences"}
        </Button>
      </div>
    </div>
  )
}
