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

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Box>
        <Heading mb={6}>Welcome back!</Heading>
        
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Active Tasks</StatLabel>
                  <StatNumber>12</StatNumber>
                  <StatHelpText>3 due today</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Goals Progress</StatLabel>
                  <StatNumber>68%</StatNumber>
                  <StatHelpText>5 active goals</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Habit Streak</StatLabel>
                  <StatNumber>7 days</StatNumber>
                  <StatHelpText>Keep it up!</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Journal Entries</StatLabel>
                  <StatNumber>24</StatNumber>
                  <StatHelpText>This month</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Box>
    </DashboardLayout>
  )
}