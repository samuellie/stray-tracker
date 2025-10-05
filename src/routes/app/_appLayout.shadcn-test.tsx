import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Checkbox } from '~/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Switch } from '~/components/ui/switch'
import { Progress } from '~/components/ui/progress'
import { Slider } from '~/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Separator } from '~/components/ui/separator'
import { Skeleton } from '~/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Toggle } from '~/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '~/components/ui/hover-card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarInset,
} from '~/components/ui/sidebar'
import { Toaster } from '~/components/ui/sonner'
import { Spinner } from '~/components/ui/spinner'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '~/components/ui/navigation-menu'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '~/components/ui/menubar'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '~/components/ui/input-otp'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { ScrollArea } from '@radix-ui/react-scroll-area'

export const Route = createFileRoute('/app/_appLayout/shadcn-test')({
  component: ShadcnTestComponent,
})

function ShadcnTestComponent() {
  const [inputValue, setInputValue] = React.useState('')
  const [checkboxes, setCheckboxes] = React.useState({
    option1: false,
    option2: true,
    option3: false,
  })
  const [textareaValue, setTextareaValue] = React.useState('')
  const [switchOn, setSwitchOn] = React.useState(false)
  const [progressValue, setProgressValue] = React.useState(33)
  const [sliderValue, setSliderValue] = React.useState([50])
  const [selectValue, setSelectValue] = React.useState('')
  const [radioValue, setRadioValue] = React.useState('option1')
  const [tabValue, setTabValue] = React.useState('tab1')
  const [sheetOpen, setSheetOpen] = React.useState(false)

  const handleCheckboxChange = (option: keyof typeof checkboxes) => {
    setCheckboxes(prev => ({
      ...prev,
      [option]: !prev[option],
    }))
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          shadcn/ui Component Test Page
        </h1>

        <div className="space-y-8">
          {/* Form Components */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Input & Textarea</CardTitle>
                <CardDescription>Test form inputs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input">Input Field</Label>
                  <Input
                    id="input"
                    placeholder="Enter some text..."
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textarea">Textarea</Label>
                  <Textarea
                    id="textarea"
                    placeholder="Enter multiple lines of text..."
                    value={textareaValue}
                    onChange={e => setTextareaValue(e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Input: <strong>{inputValue || 'empty'}</strong> | Textarea:{' '}
                  <strong>{textareaValue.length} chars</strong>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Checkbox</CardTitle>
                <CardDescription>Test checkbox states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkbox1"
                    checked={checkboxes.option1}
                    onCheckedChange={() => handleCheckboxChange('option1')}
                  />
                  <Label htmlFor="checkbox1">Option 1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkbox2"
                    checked={checkboxes.option2}
                    onCheckedChange={() => handleCheckboxChange('option2')}
                  />
                  <Label htmlFor="checkbox2">Option 2 (checked)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkbox3"
                    disabled
                    checked={checkboxes.option3}
                    onCheckedChange={() => handleCheckboxChange('option3')}
                  />
                  <Label htmlFor="checkbox3">Disabled</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Radio Group</CardTitle>
                <CardDescription>Select one option</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="radio1" />
                    <Label htmlFor="radio1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="radio2" />
                    <Label htmlFor="radio2">Option 2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option3" id="radio3" />
                    <Label htmlFor="radio3">Option 3</Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-gray-600">
                  Selected: <strong>{radioValue}</strong>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Switch</CardTitle>
                <CardDescription>Toggle on/off states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="switch1"
                    checked={switchOn}
                    onCheckedChange={setSwitchOn}
                  />
                  <Label htmlFor="switch1">Enable feature</Label>
                </div>
                <p className="text-sm text-gray-600">
                  State: <strong>{switchOn ? 'ON' : 'OFF'}</strong>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select</CardTitle>
                <CardDescription>Choose from options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectValue} onValueChange={setSelectValue}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                    <SelectItem value="option4" disabled>
                      Disabled Option
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600">
                  Selected: <strong>{selectValue || 'none'}</strong>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress & Slider</CardTitle>
                <CardDescription>Visual progress indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Progress ({progressValue}%)</Label>
                  <Progress value={progressValue} />
                </div>
                <div className="space-y-2">
                  <Label>Slider ({sliderValue[0]}%)</Label>
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Layout Components */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tabs</CardTitle>
                <CardDescription>Organize content in tabs</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={tabValue} onValueChange={setTabValue}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1" className="mt-4">
                    <p>
                      This is the content for Tab 1. You can put any component
                      here.
                    </p>
                  </TabsContent>
                  <TabsContent value="tab2" className="mt-4">
                    <p>Content for Tab 2. Different content for each tab.</p>
                  </TabsContent>
                  <TabsContent value="tab3" className="mt-4">
                    <p>Tab 3 content goes here.</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tooltip</CardTitle>
                  <CardDescription>Hover for more info</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover me</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is a tooltip!</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="secondary" size="icon">
                        ?
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Help text here</p>
                    </TooltipContent>
                  </Tooltip>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popover</CardTitle>
                  <CardDescription>Click for more content</CardDescription>
                </CardHeader>
                <CardContent>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Open Popover</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">
                            Popover Content
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            This is additional content shown in a popover.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">Action 1</Button>
                          <Button size="sm" variant="outline">
                            Action 2
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Toggle Group</CardTitle>
                <CardDescription>Multiple clickable options</CardDescription>
              </CardHeader>
              <CardContent>
                <ToggleGroup type="multiple" className="justify-start">
                  <ToggleGroupItem value="bold" aria-label="Toggle bold">
                    B
                  </ToggleGroupItem>
                  <ToggleGroupItem value="italic" aria-label="Toggle italic">
                    I
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="underline"
                    aria-label="Toggle underline"
                  >
                    U
                  </ToggleGroupItem>
                  <Toggle
                    value="strikethrough"
                    aria-label="Toggle strikethrough"
                  >
                    S
                  </Toggle>
                </ToggleGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skeleton</CardTitle>
                <CardDescription>Loading states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[160px]" />
                  </div>
                </div>
                <Skeleton className="h-[100px] w-full rounded-lg" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Table</CardTitle>
                <CardDescription>Data display component</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of recent invoices.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Invoice</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">INV001</TableCell>
                      <TableCell>Paid</TableCell>
                      <TableCell>Credit Card</TableCell>
                      <TableCell className="text-right">$250.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">INV002</TableCell>
                      <TableCell>Pending</TableCell>
                      <TableCell>PayPal</TableCell>
                      <TableCell className="text-right">$150.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Additional Components */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Form Component</CardTitle>
                  <CardDescription>Form with validation</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Sign In
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dropdown Menu</CardTitle>
                  <CardDescription>Contextual menu options</CardDescription>
                </CardHeader>
                <CardContent>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Open Menu</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuItem>Support</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hover Card</CardTitle>
                  <CardDescription>Hover for additional info</CardDescription>
                </CardHeader>
                <CardContent>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="link">@shadcnhq</Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">@shadcnhq</h4>
                        <p className="text-sm">
                          Beautiful and accessible UI components built with
                          Radix UI and styled with Tailwind CSS.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Input OTP</CardTitle>
                  <CardDescription>One-time password input</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Mobile OTP</Label>
                    <InputOTP maxLength={6}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <p className="text-xs text-gray-500">
                      Enter the 6-digit code sent to your phone
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sheet</CardTitle>
                  <CardDescription>Slide-out panel component</CardDescription>
                </CardHeader>
                <CardContent>
                  <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline">Open Sheet</Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Sheet Title</SheetTitle>
                        <SheetDescription>
                          This is a sheet component that slides in from the
                          side.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-4">
                        <p>Sheet content goes here.</p>
                        <Button
                          className="mt-4"
                          onClick={() => setSheetOpen(false)}
                        >
                          Close Sheet
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sidebar</CardTitle>
                  <CardDescription>
                    Collapsible sidebar component
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 border rounded-lg overflow-hidden">
                    <SidebarProvider defaultOpen={false}>
                      <Sidebar collapsible="none">
                        <SidebarHeader>
                          <div className="px-2 py-1">
                            <h3 className="text-sm font-semibold">Sidebar</h3>
                          </div>
                        </SidebarHeader>
                        <SidebarContent>
                          <SidebarMenu>
                            <SidebarMenuItem>
                              <SidebarMenuButton>Home</SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                              <SidebarMenuButton>Settings</SidebarMenuButton>
                            </SidebarMenuItem>
                          </SidebarMenu>
                        </SidebarContent>
                      </Sidebar>
                      <SidebarInset>
                        <header className="flex h-12 items-center gap-2 px-4">
                          <SidebarTrigger />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold">
                              Main Content
                            </h4>
                          </div>
                        </header>
                        <div className="flex-1 p-4">
                          <p>
                            Sidebar content area. Use the trigger to
                            collapse/expand.
                          </p>
                        </div>
                      </SidebarInset>
                    </SidebarProvider>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sonner Toasts</CardTitle>
                  <CardDescription>Toast notification examples</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => toast('This is a basic toast message!')}
                    >
                      Basic Toast
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        toast.success('Success! Operation completed.')
                      }
                    >
                      Success Toast
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        toast.error('Error! Something went wrong.')
                      }
                    >
                      Error Toast
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        toast('Custom toast', {
                          description: 'This has a description',
                          action: {
                            label: 'Action',
                            onClick: () => console.log('Action clicked'),
                          },
                        })
                      }
                    >
                      Custom Toast
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Click buttons to see different toast types
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spinner</CardTitle>
                  <CardDescription>Loading spinner component</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Spinner />
                    <span className="text-sm">Loading...</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Spinner className="h-8 w-8" />
                    <span className="text-sm">Large spinner</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Spinner className="h-6 w-6 text-blue-500" />
                    <span className="text-sm">Custom color spinner</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation Components */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Navigation Menu</CardTitle>
                  <CardDescription>Breadcrumbs and navigation</CardDescription>
                </CardHeader>
                <CardContent>
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>
                          Getting started
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                            <li className="row-span-3">
                              <NavigationMenuLink asChild>
                                <a
                                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                  href="/"
                                >
                                  <div className="mb-2 mt-4 text-lg font-medium">
                                    shadcn/ui
                                  </div>
                                  <p className="text-sm leading-tight text-muted-foreground">
                                    Beautifully designed components built with
                                    Radix UI and styled with Tailwind CSS.
                                  </p>
                                </a>
                              </NavigationMenuLink>
                            </li>
                            <li>
                              <NavigationMenuLink asChild>
                                <a
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  href="#"
                                >
                                  <div className="text-sm font-medium leading-none">
                                    Introduction
                                  </div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    Re-usable components built using Radix UI
                                    and styled with Tailwind CSS.
                                  </p>
                                </a>
                              </NavigationMenuLink>
                            </li>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>
                          Components
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            <li>
                              <NavigationMenuLink asChild>
                                <a
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  href="#"
                                >
                                  <div className="text-sm font-medium leading-none">
                                    Accordion
                                  </div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    A vertically stacked set of interactive
                                    headings.
                                  </p>
                                </a>
                              </NavigationMenuLink>
                            </li>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Menubar</CardTitle>
                  <CardDescription>Application menu bar</CardDescription>
                </CardHeader>
                <CardContent>
                  <Menubar>
                    <MenubarMenu>
                      <MenubarTrigger>File</MenubarTrigger>
                      <MenubarContent>
                        <MenubarItem>New File</MenubarItem>
                        <MenubarItem>New Folder</MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>Share</MenubarItem>
                      </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                      <MenubarTrigger>Edit</MenubarTrigger>
                      <MenubarContent>
                        <MenubarItem>Undo</MenubarItem>
                        <MenubarItem>Redo</MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>Cut</MenubarItem>
                        <MenubarItem>Copy</MenubarItem>
                        <MenubarItem>Paste</MenubarItem>
                      </MenubarContent>
                    </MenubarMenu>
                  </Menubar>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pagination</CardTitle>
                  <CardDescription>Navigate through pages</CardDescription>
                </CardHeader>
                <CardContent>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>
                          1
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">2</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  )
}
