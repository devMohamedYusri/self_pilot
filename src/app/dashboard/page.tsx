'use client'

import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { DashboardLayout } from '@/app/components/layout/DashboardLayout'
import { AISuggestions } from '@/app/components/ai/AISuggestions'
import { FloatingChatButton } from '@/app/components/chat/FloatingChatButton'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    tasks: { active: 0, dueToday: 0 },
    goals: { active: 0, progress: 0 },
    habits: { active: 0, streak: 0 },
    journal: { entries: 0 }
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  return (
    <DashboardLayout>
      <Box>
        <Heading mb={6}>Welcome back!</Heading>
        
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} mb={8}>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Active Tasks</StatLabel>
                  <StatNumber>{stats.tasks.active}</StatNumber>
                  <StatHelpText>{stats.tasks.dueToday} due today</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Goals Progress</StatLabel>
                  <StatNumber>{stats.goals.progress}%</StatNumber>
                  <StatHelpText>{stats.goals.active} active goals</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Habit Streak</StatLabel>
                  <StatNumber>{stats.habits.streak} days</StatNumber>
                  <StatHelpText>{stats.habits.active} active habits</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Journal Entries</StatLabel>
                  <StatNumber>{stats.journal.entries}</StatNumber>
                  <StatHelpText>This month</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          <GridItem>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Recent Activity</Heading>
                <Text color="gray.600">Your recent tasks and activities will appear here.</Text>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <AISuggestions />
          </GridItem>
        </Grid>

        <FloatingChatButton />
      </Box>
    </DashboardLayout>
  )
}