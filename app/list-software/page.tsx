'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { Upload, Plus, X, Check, Users, Award, Info, ListChecks, LifeBuoy, Image as ImageIcon, Film } from 'lucide-react'
import { createClient } from 'utils/supabase/client'

const MEDIA_BUCKET = 'test-images'

interface PricingPlan {
  plan_name: string
  cost: string
  included_features: string
  payment_options: string[]
}

interface FormData {
  productName: string
  shortDescription: string
  uiType: string[]
  uiDescription: string
  features: { name: string; description: string }[]
  pricingPlans: PricingPlan[]
  freeTrialAvailable: boolean
  freeVersion: boolean
  supportChannels: string[]
  supportHours: string
  selfHelpResources: boolean
  trainingOptions: string[]
  platforms: string[]
  targetCustomers: string[]
  images: string[]
  videos: string[]
  logo: string
}

const ListSoftwarePage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    shortDescription: '',
    uiType: [],
    uiDescription: '',
    features: [{ name: '', description: '' }],
    pricingPlans: [{ plan_name: '', cost: '', included_features: '', payment_options: [] }],
    freeTrialAvailable: false,
    freeVersion: false,
    supportChannels: [],
    supportHours: '',
    selfHelpResources: false,
    trainingOptions: [],
    platforms: [],
    targetCustomers: [],
    images: [],
    videos: [],
    logo: ''
  })

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<any>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Session error:', error)
          setError('Failed to get user session')
          return
        }
        setSession(session)
        
        if (!session) {
          setError('Please log in to submit software')
        }
      } catch (err) {
        console.error('Unexpected session error:', err)
        setError('Authentication error occurred')
      }
    }
    
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      setSession(session)
      if (!session && event === 'SIGNED_OUT') {
        setError('Please log in to submit software')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayToggle = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[]
      return {
        ...prev,
        [field]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      }
    })
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { name: '', description: '' }]
    }))
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const updateFeature = (index: number, field: 'name' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }))
  }

  const addPricingPlan = () => {
    setFormData(prev => ({
      ...prev,
      pricingPlans: [...prev.pricingPlans, { plan_name: '', cost: '', included_features: '', payment_options: [] }]
    }))
  }

  const removePricingPlan = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pricingPlans: prev.pricingPlans.filter((_, i) => i !== index)
    }))
  }

  const updatePricingPlan = (index: number, field: keyof PricingPlan, value: any) => {
    setFormData(prev => ({
      ...prev,
      pricingPlans: prev.pricingPlans.map((plan, i) => 
        i === index ? { ...plan, [field]: value } : plan
      )
    }))
  }

  const togglePlanPaymentOption = (planIndex: number, option: string) => {
    setFormData(prev => ({
      ...prev,
      pricingPlans: prev.pricingPlans.map((plan, i) => {
        if (i === planIndex) {
          const currentOptions = plan.payment_options || []
          return {
            ...plan,
            payment_options: currentOptions.includes(option)
              ? currentOptions.filter(o => o !== option)
              : [...currentOptions, option]
          }
        }
        return plan
      })
    }))
  }

  const parseCostToNumber = (value: string): number | null => {
    const numeric = value.replace(/[^0-9.]/g, '')
    if (!numeric) return null
    const n = Number(numeric)
    return Number.isFinite(n) ? n : null
  }

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setLogoFile(file)
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setImageFiles(Array.from(e.target.files))
  }

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setVideoFiles(Array.from(e.target.files))
  }

  const uploadFile = async (file: File, userId: string, type: 'image' | 'video' | 'logo'): Promise<string> => {
    const folder = `${userId}`
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${folder}/${type}s/${timestamp}-${sanitizedName}`

    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file)

    if (uploadError) {
      if (uploadError.message.includes('Bucket not found')) {
        throw new Error("Upload failed: Bucket 'test-images' not found. Create it in Supabase Storage or change MEDIA_BUCKET.")
      }
      if (uploadError.message.includes('row-level security policy')) {
        throw new Error('Storage access denied. Please check your storage permissions.')
      }
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    const { data } = supabase.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(path)

    return data.publicUrl
  }

  const uploadAllMedia = async (): Promise<{ mediaUrls: string[], logoUrl: string }> => {
    if (!session?.user?.id) {
      throw new Error('No user session available for file upload')
    }
    
    const userId = session.user.id
    setUploadingMedia(true)
    try {
      // Upload logo first separately
      const logoUrl = logoFile ? await uploadFile(logoFile, userId, 'logo') : ''
      
      // Then upload images and videos
      const imageUploads = imageFiles.map(f => uploadFile(f, userId, 'image'))
      const videoUploads = videoFiles.map(f => uploadFile(f, userId, 'video'))
      
      const mediaUrls = await Promise.all([...imageUploads, ...videoUploads])
      
      return { mediaUrls, logoUrl }
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (currentStep !== 4) {
      return
    }

    if (!session?.user?.id) {
      setError('User session is invalid. Please log out and log back in.')
      return
    }

    try {
      setSubmitting(true)

      // Upload all media first
      let uploadedMediaUrls: string[] = []
      let uploadedLogoUrl = ''
      try {
        const { mediaUrls, logoUrl } = await uploadAllMedia()
        uploadedMediaUrls = mediaUrls
        uploadedLogoUrl = logoUrl
        console.log('Logo uploaded successfully:', uploadedLogoUrl)
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload media')
        return
      }

      // Prepare insert data with logo included
      const insertData = {
        name: formData.productName,
        description: formData.shortDescription,
        ui_type: formData.uiType,
        ui_description: formData.uiDescription,
        platform_supported: formData.platforms,
        typical_customers: formData.targetCustomers,
        content: uploadedMediaUrls,
        logo: uploadedLogoUrl || null, // Include logo in initial insert
        free_trial: formData.freeTrialAvailable,
        free_version: formData.freeVersion,
        user_id: session.user.id
      }

      console.log('Inserting software with data:', insertData)

      const { data: softwareData, error: softwareError } = await (supabase as any)
        .from('Software')
        .insert(insertData)
        .select('software_id')
        .single()

      if (softwareError) {
        console.error('Software insert error:', softwareError)
        
        if (softwareError.message.includes('row-level security policy')) {
          throw new Error('Permission denied. Please ensure you are logged in and have the correct permissions.')
        }
        throw new Error(`Failed to create Software: ${softwareError.message}`)
      }

      const softwareId = softwareData?.software_id
      if (!softwareId) {
        throw new Error('Failed to create Software: no primary key returned')
      }

      console.log('Software created successfully with ID:', softwareId)

      // Insert features
      const featureRows = (formData.features || [])
        .filter(f => f.name.trim() || f.description.trim())
        .map(f => ({
          software_id: softwareId,
          feature_name: f.name,
          feature_description: f.description
        }))

      if (featureRows.length > 0) {
        const { error: featureError } = await (supabase as any)
          .from('Feature')
          .insert(featureRows)
        if (featureError) {
          throw new Error(`Failed to create Features: ${featureError.message}`)
        }
      }

      // Insert pricing plans
      const pricingRows = (formData.pricingPlans || [])
        .filter(p => p.plan_name.trim())
        .map(p => ({
          software_id: softwareId,
          plan_name: p.plan_name,
          cost: parseCostToNumber(p.cost),
          included_features: p.included_features,
          payment_options: p.payment_options
        }))

      if (pricingRows.length > 0) {
        const { error: pricingError } = await (supabase as any)
          .from('PricingPlan')
          .insert(pricingRows)
        if (pricingError) {
          throw new Error(`Failed to create PricingPlans: ${pricingError.message}`)
        }
      }

      const { error: supportError } = await (supabase as any)
        .from('SupportOption')
        .insert({
          software_id: softwareId,
          channels: formData.supportChannels,
          hours: formData.supportHours ? [formData.supportHours] : [],
          training_options: formData.trainingOptions,
          self_help_resources: formData.selfHelpResources
        })
      if (supportError) {
        throw new Error(`Failed to create SupportOption: ${supportError.message}`)
      }

      // Clear form
      setImageFiles([])
      setVideoFiles([])
      setLogoFile(null)
      setLogoPreview(null)
      setIsSubmitted(true)
    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err?.message || 'An unexpected error occurred while submitting.')
    } finally {
      setSubmitting(false)
    }
  }

  const steps = [
    { id: 1, title: 'Software Overview', description: 'Basic information about your software', icon: Info },
    { id: 2, title: 'Features & Pricing', description: 'Detailed features and pricing information', icon: ListChecks },
    { id: 3, title: 'Support & Platform', description: 'Support options and platform details', icon: LifeBuoy },
    { id: 4, title: 'Media & Submit', description: 'Upload images/videos and submit', icon: Upload }
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Software Submitted!
            </h2>
            <p className="text-gray-600 mb-8">
              Thank you for submitting your software. Our team will review it and add it to our platform within 2-3 business days.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false)
                setCurrentStep(1)
                setFormData({
                  productName: '',
                  shortDescription: '',
                  uiType: [],
                  uiDescription: '',
                  features: [{ name: '', description: '' }],
                  pricingPlans: [{ plan_name: '', cost: '', included_features: '', payment_options: [] }],
                  freeTrialAvailable: false,
                  freeVersion: false,
                  supportChannels: [],
                  supportHours: '',
                  selfHelpResources: false,
                  trainingOptions: [],
                  platforms: [],
                  targetCustomers: [],
                  images: [],
                  videos: [],
                  logo: ''
                })
                setLogoFile(null)
                setLogoPreview(null)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Submit Another Software
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            List Your Software on Car Rentall Software
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Reach thousands of car rental businesses looking for the perfect software solution
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex flex-col items-center ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      currentStep >= step.id 
                        ? 'bg-blue-100 border-blue-600' 
                        : 'bg-gray-100 border-gray-300'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-sm font-semibold">{step.title}</div>
                      <div className="text-xs">{step.description}</div>
                    </div>
                  </div>
                  {step.id < steps.length && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )})}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} onKeyDown={(e) => {
            if (e.key === 'Enter' && currentStep !== 4) {
              e.preventDefault()
            }
          }}>
            
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Software Overview</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    placeholder="Provide a brief overview of your software and its main benefits..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Software Logo (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="flex flex-col items-center gap-3">
                      {logoPreview ? (
                        <div className="relative">
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="w-32 h-32 object-contain rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setLogoFile(null)
                              setLogoPreview(null)
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="text-sm"
                      />
                      <p className="text-xs text-gray-500 text-center">
                        Recommended: Square image, at least 200x200px
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">2. User Interface</h2>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    UI Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Web', 'Mobile', 'Desktop', 'Multi-platform'].map((type) => (
                      <label key={type} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.uiType.includes(type)}
                          onChange={() => handleArrayToggle('uiType', type)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UI Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.uiDescription}
                    onChange={(e) => handleInputChange('uiDescription', e.target.value)}
                    placeholder="Describe the user interface and user experience..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Key Features</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Key Features 
                  </label>
                  <div className="space-y-4">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Feature Name
                          </label>
                          <input
                            type="text"
                            value={feature.name}
                            onChange={(e) => updateFeature(index, 'name', e.target.value)}
                            placeholder="e.g., Fleet Management"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Feature Description
                          </label>
                          <input
                            type="text"
                            value={feature.description}
                            onChange={(e) => updateFeature(index, 'description', e.target.value)}
                            placeholder="Brief description of the feature"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFeature}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Add More Features
                    </button>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Pricing Plans</h2>
                
                <div className="space-y-4 mb-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.freeTrialAvailable}
                      onChange={(e) => handleInputChange('freeTrialAvailable', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Free Trial Available</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.freeVersion}
                      onChange={(e) => handleInputChange('freeVersion', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Free Version Available</span>
                  </label>
                </div>

                <div className="space-y-4">
                  {formData.pricingPlans.map((plan, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Plan Name
                          </label>
                          <input
                            type="text"
                            required
                            value={plan.plan_name}
                            onChange={(e) => updatePricingPlan(index, 'plan_name', e.target.value)}
                            placeholder="e.g., Professional Plan"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cost (per month)
                          </label>
                          <input
                            type="text"
                            required
                            value={plan.cost}
                            onChange={(e) => updatePricingPlan(index, 'cost', e.target.value)}
                            placeholder="e.g., 99.00 or Leave Empty if Price is Negotiable"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Features Included
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={plan.included_features}
                          onChange={(e) => updatePricingPlan(index, 'included_features', e.target.value)}
                          placeholder="List the main features included in this plan..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Payment Options
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {['Credit Card', 'Paypal', 'Invoice', 'Bank Transfer', 'Other'].map((option) => (
                            <label key={option} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={plan.payment_options?.includes(option) || false}
                                onChange={() => togglePlanPaymentOption(index, option)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {formData.pricingPlans.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePricingPlan(index)}
                          className="text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <X className="h-4 w-4" />
                          Remove Plan
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPricingPlan}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Pricing Plan
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Support Options</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Support Channels
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Phone', 'Email', 'Chat', 'Knowledge Base'].map((channel) => (
                      <label key={channel} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.supportChannels.includes(channel)}
                          onChange={() => handleArrayToggle('supportChannels', channel)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Support Hours
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['8am - 5pm', '9am - 6pm', '24/7', 'Custom'].map((hours) => (
                      <label key={hours} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="supportHours"
                          value={hours}
                          checked={formData.supportHours === hours}
                          onChange={(e) => handleInputChange('supportHours', e.target.value)}
                          className="border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{hours}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.selfHelpResources}
                      onChange={(e) => handleInputChange('selfHelpResources', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Self Help Resources Available</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Training Options
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {['In person', 'Live Online', 'Webinars', 'Documentation'].map((option) => (
                      <label key={option} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.trainingOptions.includes(option)}
                          onChange={() => handleArrayToggle('trainingOptions', option)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Platform Supported</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Web-based', 'iPhone App', 'Android App', 'Windows Phone App'].map((platform) => (
                      <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.platforms.includes(platform)}
                          onChange={() => handleArrayToggle('platforms', platform)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Target Customers</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['Freelancers', 'Small Businesses', 'Mid Size Businesses', 'Large Enterprises'].map((customer) => (
                      <label key={customer} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.targetCustomers.includes(customer)}
                          onChange={() => handleArrayToggle('targetCustomers', customer)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{customer}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Media & Submit</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Add Images/Screenshots
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-6 w-6 text-gray-500" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleImageChange}
                        className="flex-1"
                      />
                    </div>
                    {imageFiles.length > 0 && (
                      <ul className="mt-3 text-sm text-gray-600 list-disc list-inside">
                        {imageFiles.map((f, idx) => (
                          <li key={idx}>{f.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Add Videos
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                      <Film className="h-6 w-6 text-gray-500" />
                      <input 
                        type="file" 
                        accept="video/*" 
                        multiple 
                        onChange={handleVideoChange}
                        className="flex-1"
                      />
                    </div>
                    {videoFiles.length > 0 && (
                      <ul className="mt-3 text-sm text-gray-600 list-disc list-inside">
                        {videoFiles.map((f, idx) => (
                          <li key={idx}>{f.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Review Your Submission</h3>
                  <p className="text-blue-700 text-sm mb-4">
                    Please review all information before submitting. Our team will review your software listing within 2-3 business days.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Product Name:</span> {formData.productName || 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium">Logo:</span> {logoFile ? logoFile.name : 'Not uploaded'}
                    </div>
                    <div>
                      <span className="font-medium">Pricing Plans:</span> {formData.pricingPlans.length}
                    </div>
                    <div>
                      <span className="font-medium">Platform Types:</span> {formData.uiType.join(', ') || 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium">Target Customers:</span> {formData.targetCustomers.join(', ') || 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium">Media Files:</span> {imageFiles.length + videoFiles.length} file(s)
                    </div>
                  </div>
                </div>

                {(uploadingMedia || submitting) && (
                  <div className="text-sm text-gray-600">{uploadingMedia ? 'Uploading media...' : 'Submitting...'}</div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1 || submitting}
                className={`py-3 px-6 rounded-lg font-semibold transition-colors ${
                  currentStep === 1 || submitting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentStep(Math.min(4, currentStep + 1))
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
                  disabled={submitting}
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
                  disabled={submitting || !session?.user?.id}
                >
                  {submitting ? 'Submitting...' : 'Submit Software'}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why List Your Software on Car Rentall Software?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Reach More Customers</h3>
              <p className="text-gray-600 text-sm">Connect with thousands of car rental businesses actively looking for software solutions.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Build Credibility</h3>
              <p className="text-gray-600 text-sm">Showcase real user reviews and detailed feature comparisons to build trust with potential customers.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Setup</h3>
              <p className="text-gray-600 text-sm">Simple submission process with dedicated support to help you get listed quickly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListSoftwarePage