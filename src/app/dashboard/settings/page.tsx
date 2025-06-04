'use client'

import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Card,
  CardBody,
  CardHeader,
  Text,
  Button,
  useToast,
  Divider,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  HStack,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { DashboardLayout } from '@/app/components/layout/DashboardLayout'
import { useState, useEffect } from 'react'

interface AISettings {
  // General
  aiProvider: string
  autoApprove: boolean
  smartSuggestions: boolean
  proactiveMode: boolean
  
  // Permissions
  permissions: {
    tasks: 'ask' | 'auto' | 'never'
    goals: 'ask' | 'auto' | 'never'
    habits: 'ask' | 'auto' | 'never'
    routines: 'ask' | 'auto' | 'never'
    journal: 'ask' | 'auto' | 'never'
  }
  
  // Behavior
  suggestionFrequency: number // 1-10
  confidenceThreshold: number // 0-100
  personalityMode: 'professional' | 'friendly' | 'motivational' | 'minimal'
  
  // Notifications
  notifications: {
    suggestions: boolean
    reminders: boolean
    insights: boolean
    achievements: boolean
  }
}

export default function SettingsPage() {
  const toast = useToast()
  const [settings, setSettings] = useState<AISettings>({
    aiProvider: 'auto',
    autoApprove: false,
    smartSuggestions: true,
    proactiveMode: true,
    permissions: {
      tasks: 'ask',
      goals: 'ask',
      habits: 'ask',
      routines: 'ask',
      journal: 'ask',
    },
    suggestionFrequency: 5,
    confidenceThreshold: 70,
    personalityMode: 'friendly',
    notifications: {
      suggestions: true,
      reminders: true,
      insights: true,
      achievements: true,
    }
  })
  const [providers, setProviders] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchProviders()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/ai')
      const data = await res.json()
      setSettings(data)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/ai/providers')
      const data = await res.json()
      setProviders(data.providers)
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/settings/ai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        toast({
          title: 'Settings saved',
          description: 'Your AI preferences have been updated',
          status: 'success',
          duration: 3000,
        })
      }
    } catch (error) { // Fixed: Now using the error variable
      console.error('Failed to save AI settings:', error) // Fixed: Added error logging
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        status: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'auto': return 'green'
      case 'ask': return 'yellow'
      case 'never': return 'red'
      default: return 'gray'
    }
  }

  return (
    <DashboardLayout>
      <Box maxW="1000px">
        <Heading mb={6}>AI Assistant Settings</Heading>

        <Tabs colorScheme="brand">
          <TabList>
            <Tab>General</Tab>
            <Tab>Permissions</Tab>
            <Tab>Behavior</Tab>
            <Tab>Notifications</Tab>
          </TabList>

          <TabPanels>
            {/* General Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md">AI Configuration</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>AI Provider</FormLabel>
                        <Select
                          value={settings.aiProvider}
                          onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
                        >
                          <option value="auto">Auto (Use best available)</option>
                          {providers.map(provider => (
                            <option key={provider} value={provider}>{provider}</option>
                          ))}
                        </Select>
                        <Text fontSize="sm" color="gray.600" mt={1}>
                          The AI will automatically switch providers if one becomes unavailable
                        </Text>
                      </FormControl>

                      <Divider />

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Proactive AI Mode</FormLabel>
                        <Switch
                          isChecked={settings.proactiveMode}
                          onChange={(e) => setSettings({ ...settings, proactiveMode: e.target.checked })}
                        />
                      </FormControl>
                      <Text fontSize="sm" color="gray.600" mt={-2}>
                        AI will actively monitor your activities and suggest improvements
                      </Text>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Smart Suggestions</FormLabel>
                        <Switch
                          isChecked={settings.smartSuggestions}
                          onChange={(e) => setSettings({ ...settings, smartSuggestions: e.target.checked })}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Auto-approve AI suggestions</FormLabel>
                        <Switch
                          isChecked={settings.autoApprove}
                          onChange={(e) => setSettings({ ...settings, autoApprove: e.target.checked })}
                        />
                      </FormControl>
                      {settings.autoApprove && (
                        <Badge colorScheme="orange">
                          Warning: AI will make changes without your approval
                        </Badge>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Permissions */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Entity Permissions</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Control how AI interacts with different types of data
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {Object.entries(settings.permissions).map(([entity, permission]) => (
                      <FormControl key={entity}>
                        <HStack justify="space-between">
                          <FormLabel mb="0">
                            {entity.charAt(0).toUpperCase() + entity.slice(1)}
                          </FormLabel>
                          <Select
                            value={permission}
                            onChange={(e) => setSettings({
                              ...settings,
                              permissions: {
                                ...settings.permissions,
                                [entity]: e.target.value as 'ask' | 'auto' | 'never'
                              }
                            })}
                            width="200px"
                          >
                            <option value="ask">Ask before changes</option>
                            <option value="auto">Auto-manage</option>
                            <option value="never">Never modify</option>
                          </Select>
                        </HStack>
                        <Badge colorScheme={getPermissionColor(permission)} size="sm" mt={1}>
                          {permission === 'auto' && 'AI has full control'}
                          {permission === 'ask' && 'AI will request approval'}
                          {permission === 'never' && 'AI cannot modify'}
                        </Badge>
                      </FormControl>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Behavior */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md">AI Behavior</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <FormControl>
                        <FormLabel>Suggestion Frequency</FormLabel>
                        <HStack spacing={4}>
                          <Slider
                            value={settings.suggestionFrequency}
                            onChange={(value) => setSettings({ ...settings, suggestionFrequency: value })}
                            min={1}
                            max={10}
                          >
                            <SliderTrack>
                              <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                          </Slider>
                          <Text minW="50px">{settings.suggestionFrequency}/10</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600" mt={1}>
                          How often AI should make suggestions (1 = rarely, 10 = very often)
                        </Text>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Confidence Threshold</FormLabel>
                        <HStack spacing={4}>
                          <Slider
                            value={settings.confidenceThreshold}
                            onChange={(value) => setSettings({ ...settings, confidenceThreshold: value })}
                            min={0}
                            max={100}
                          >
                            <SliderTrack>
                              <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                          </Slider>
                          <Text minW="50px">{settings.confidenceThreshold}%</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600" mt={1}>
                          Minimum confidence level for AI to make suggestions
                        </Text>
                      </FormControl>

                      <FormControl>
                        <FormLabel>AI Personality</FormLabel>
                        <Select
                          value={settings.personalityMode}
                          onChange={(e) => setSettings({ ...settings, personalityMode: e.target.value as 'professional' | 'friendly' | 'motivational' | 'minimal' })}
                        >
                          <option value="professional">Professional</option>
                          <option value="friendly">Friendly</option>
                          <option value="motivational">Motivational</option>
                          <option value="minimal">Minimal</option>
                        </Select>
                        <Text fontSize="sm" color="gray.600" mt={1}>
                          How the AI communicates with you
                        </Text>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Notifications */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">AI Notifications</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {Object.entries(settings.notifications).map(([type, enabled]) => (
                      <FormControl key={type} display="flex" alignItems="center">
                        <FormLabel mb="0">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </FormLabel>
                        <Switch
                          isChecked={enabled}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              [type]: e.target.checked
                            }
                          })}
                        />
                      </FormControl>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Box mt={6}>
          <Button
            colorScheme="brand"
            onClick={handleSave}
            isLoading={isLoading}
            size="lg"
          >
            Save AI Settings
          </Button>
        </Box>
      </Box>
    </DashboardLayout>
  )
}