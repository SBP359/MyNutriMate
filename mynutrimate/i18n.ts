

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

type Language = 'en' | 'hi' | 'ml';
type LanguageName = 'English' | 'Hindi' | 'Malayalam';

const languageNames: { [key in Language]: LanguageName } = {
    en: 'English',
    hi: 'Hindi',
    ml: 'Malayalam',
};

type Translations = {
  [key: string]: {
    [key in Language]: string;
  };
};

const translations: Translations = {
  // General
  patient: { en: 'Patient', hi: 'मरीज', ml: 'രോഗി' },
  doctor: { en: 'Doctor', hi: 'डॉक्टर', ml: 'ഡോക്ടർ' },
  back: { en: 'Back', hi: 'वापस', ml: 'പുറകോട്ട്' },
  save: { en: 'Save', hi: 'सेव', ml: 'സേവ് ചെയ്യുക' },
  saving: { en: 'Saving...', hi: 'सेव हो रहा है...', ml: 'സേവ് ചെയ്യുന്നു...' },
  saved: { en: 'Saved!', hi: 'सेव हो गया!', ml: 'സേവ് ചെയ്തു!' },
  error: { en: 'Error', hi: 'त्रुटि', ml: 'പിശക്' },
  na: { en: 'N/A', hi: 'लागू नहीं', ml: 'ലഭ്യമല്ല' },
  changes: { en: 'Changes', hi: 'बदलाव', ml: 'മാറ്റങ്ങൾ' },
  statusLow: { en: 'Low', hi: 'कम', ml: 'കുറവ്' },
  statusHigh: { en: 'High', hi: 'अधिक', ml: 'കൂടുതൽ' },
  statusNormal: { en: 'Normal', hi: 'सामान्य', ml: 'സാധാരണം' },
  female: { en: 'Female', hi: 'महिला', ml: 'സ്ത്രീ' },
  male: { en: 'Male', hi: 'पुरुष', ml: 'പുരുഷൻ' },
  other: { en: 'Other', hi: 'अन्य', ml: 'മറ്റുള്ളവ' },
  sedentary: { en: 'Sedentary', hi: 'गतिहीन', ml: 'ഉദാസീനം' },
  lightly_active: { en: 'Lightly Active', hi: 'थोड़ा सक्रिय', ml: 'ലഘുവായി സജീവം' },
  active: { en: 'Active', hi: 'सक्रिय', ml: 'സജീവം' },
  very_active: { en: 'Very Active', hi: 'बहुत सक्रिय', ml: 'വളരെ സജീവം' },
  bmiUnderweight: { en: 'Underweight', hi: 'कम वजन', ml: 'ഭാരക്കുറവ്' },
  bmiNormal: { en: 'Normal weight', hi: 'सामान्य वजन', ml: 'സാധാരണ ഭാരം' },
  bmiOverweight: { en: 'Overweight', hi: 'अधिक वजन', ml: 'അമിതഭാരം' },
  bmiObesity: { en: 'Obesity', hi: 'मोटापा', ml: 'പൊണ്ണത്തടി' },
  ageYearsOld: { en: '{age} years old', hi: '{age} वर्ष', ml: '{age} വയസ്സ്' },
  nutrientIron: { en: 'Iron', hi: 'आयरन', ml: 'ഇരുമ്പ്' },
  nutrientCalcium: { en: 'Calcium', hi: 'कैल्शियम', ml: 'കാൽസ്യം' },
  nutrientPotassium: { en: 'Potassium', hi: 'पोटैशियम', ml: 'പൊട്ടാസ്യം' },
  nutrientVitaminC: { en: 'Vitamin C', hi: 'विटामिन सी', ml: 'വിറ്റാമിൻ സി' },
  nutrientVitaminA: { en: 'Vitamin A', hi: 'विटामिन ए', ml: 'വിറ്റാമിൻ എ' },
  nutrientVitaminD: { en: 'Vitamin D', hi: 'विटामिन डी', ml: 'വിറ്റാമിൻ ഡി' },

  // App.tsx Footer
  footerCredit: { en: 'MyNutriMate made with ❤️ by MynutriLog team, in connection with', hi: 'MyNutriMate ❤️ MynutriLog टीम द्वारा, इसके सहयोग से बनाया गया', ml: 'MyNutriMate ❤️ MynutriLog ടീം, ഇവരുമായി സഹകരിച്ച് നിർമ്മിച്ചത്' },
  footerAbdm: { en: 'Ayushman Bharat Digital Mission', hi: 'आयुष्मान भारत डिजिटल मिशन', ml: 'ആയുഷ്മാൻ ഭാരത് ഡിജിറ്റൽ മിഷൻ' },
  footerAnd: { en: ' & ', hi: ' और ', ml: ' & ' },
  footerPmjay: { en: 'Pradhan Mantri Jan Arogya Yojana', hi: 'प्रधानमंत्री जन आरोग्य योजना', ml: 'പ്രധാനമന്ത്രി ജൻ ആരോഗ്യ യോജന' },
  
  // Auth.tsx
  authWelcome: { en: 'Welcome Back!', hi: 'वापस स्वागत है!', ml: 'വീണ്ടും സ്വാഗതം!' },
  authCreatePatientAccount: { en: 'Create Patient Account', hi: 'मरीज खाता बनाएं', ml: 'രോഗിയുടെ അക്കൗണ്ട് ഉണ്ടാക്കുക' },
  authCreateDoctorAccount: { en: 'Create Doctor Account', hi: 'डॉक्टर खाता बनाएं', ml: 'ഡോക്ടറുടെ അക്കൗണ്ട് ഉണ്ടാക്കുക' },
  authLoginContinue: { en: 'Log in to continue', hi: 'जारी रखने के लिए लॉग इन करें', ml: 'തുടരാൻ ലോഗിൻ ചെയ്യുക' },
  authSignUpStart: { en: 'Sign up to get started', hi: 'शुरू करने के लिए साइन अप करें', ml: 'തുടങ്ങാൻ സൈൻ അപ്പ് ചെയ്യുക' },
  authUsername: { en: 'Username', hi: 'उपयोगकर्ता नाम', ml: 'ഉപയോക്തൃനാമം' },
  authUsernamePlaceholder: { en: 'e.g., jane_doe', hi: 'उदा., jane_doe', ml: 'ഉദാ., jane_doe' },
  authFullName: { en: 'Full Name', hi: 'पूरा नाम', ml: 'മുഴുവൻ പേര്' },
  authFullNamePlaceholder: { en: 'e.g., Jane Doe', hi: 'उदा., Jane Doe', ml: 'ഉദാ., Jane Doe' },
  authPhoneNumber: { en: 'Phone Number', hi: 'फ़ोन नंबर', ml: 'ഫോൺ നമ്പർ' },
  authPhoneNumberPlaceholder: { en: 'e.g., 9876543210', hi: 'उदा., 9876543210', ml: 'ഉദാ., 9876543210' },
  authMedicalId: { en: 'Medical Registration ID', hi: 'मेडिकल पंजीकरण आईडी', ml: 'മെഡിക്കൽ രജിസ്ട്രേഷൻ ഐഡി' },
  authMedicalIdPlaceholder: { en: 'e.g., MCI/12345', hi: 'उदा., MCI/12345', ml: 'ഉദാ., MCI/12345' },
  authSpecialization: { en: 'Specialization', hi: 'विशेषज्ञता', ml: 'സ്പെഷ്യലൈസേഷൻ' },
  authSpecializationPlaceholder: { en: 'e.g., Cardiologist', hi: 'उदा., हृदय रोग विशेषज्ञ', ml: 'ഉദാ., കാർഡിയോളജിസ്റ്റ്' },
  authEmail: { en: 'Email Address', hi: 'ईमेल पता', ml: 'ഇമെയിൽ വിലാസം' },
  authEmailPlaceholder: { en: 'you@example.com', hi: 'आप@example.com', ml: 'നിങ്ങൾ@example.com' },
  authPassword: { en: 'Password', hi: 'पासवर्ड', ml: 'പാസ്വേഡ്' },
  authCheckEmail: { en: 'Check your email for the confirmation link!', hi: 'पुष्टिकरण लिंक के लिए अपना ईमेल जांचें!', ml: 'സ്ഥിരീകരണ ലിങ്കിനായി നിങ്ങളുടെ ഇമെയിൽ പരിശോധിക്കുക!' },
  authLogin: { en: 'Log In', hi: 'लॉग इन करें', ml: 'ലോഗിൻ ചെയ്യുക' },
  authSignUp: { en: 'Sign Up', hi: 'साइन अप करें', ml: 'സൈൻ അപ്പ് ചെയ്യുക' },
  authNeedAccount: { en: 'Need an account? Sign up', hi: 'खाता नहीं है? साइन अप करें', ml: 'അക്കൗണ്ട് വേണോ? സൈൻ അപ്പ് ചെയ്യുക' },
  authHaveAccount: { en: 'Already have an account? Log in', hi: 'पहले से ही खाता है? लॉग इन करें', ml: 'അക്കൗണ്ട് ഉണ്ടോ? ലോഗിൻ ചെയ്യുക' },
  authUnknownError: { en: 'An unknown error occurred.', hi: 'एक अज्ञात त्रुटि हुई।', ml: 'അജ്ഞാതമായ ഒരു പിശക് സംഭവിച്ചു.' },

  // App.tsx Nav
  navDashboard: { en: 'Dashboard', hi: 'डैशबोर्ड', ml: 'ഡാഷ്ബോർഡ്' },
  navLogMeal: { en: 'Log Meal', hi: 'भोजन लॉग करें', ml: 'ഭക്ഷണം ലോഗ് ചെയ്യുക' },
  navGrocery: { en: 'Grocery', hi: 'किराना', ml: 'പലചരക്ക്' },
  navPrescription: { en: 'Prescription', hi: 'नुस्खा', ml: 'കുറിപ്പടി' },
  navHistory: { en: 'History', hi: 'इतिहास', ml: 'ചരിത്രം' },
  navMyFiles: { en: 'My Files', hi: 'मेरी फ़ाइलें', ml: 'എൻ്റെ ഫയലുകൾ' },
  navProfile: { en: 'Profile', hi: 'प्रोफ़ाइल', ml: 'പ്രൊഫൈൽ' },
  navMyPatients: { en: 'My Patients', hi: 'मेरे मरीज़', ml: 'എൻ്റെ രോഗികൾ' },
  configNeeded: { en: 'Configuration Needed', hi: 'कॉन्फ़िगरेशन आवश्यक है', ml: 'കോൺഫിഗറേഷൻ ആവശ്യമാണ്' },
  supabaseWarning: { en: 'Your Supabase credentials are not configured. Please open `services/supabaseClient.ts` and add your credentials.', hi: 'आपके Supabase क्रेडेंशियल कॉन्फ़िगर नहीं हैं। कृपया `services/supabaseClient.ts` खोलें और अपने क्रेडेंशियल जोड़ें।', ml: 'നിങ്ങളുടെ Supabase ക്രെഡൻഷ്യലുകൾ കോൺഫിഗർ ചെയ്തിട്ടില്ല. ദയവായി `services/supabaseClient.ts` തുറന്ന് നിങ്ങളുടെ ക്രെഡൻഷ്യലുകൾ ചേർക്കുക.' },
  analyzing: { en: 'Analyzing...', hi: 'विश्लेषण हो रहा है...', ml: 'വിശകലനം ചെയ്യുന്നു...' },
  scanningLabel: { en: 'Scanning Label...', hi: 'लेबल स्कैन हो रहा है...', ml: 'ലേബൽ സ്കാൻ ചെയ്യുന്നു...' },
  viewGroceryList: { en: 'View My Grocery List', hi: 'मेरी किराना सूची देखें', ml: 'എന്റെ പലചരക്ക് ലിസ്റ്റ് കാണുക' },
  
  // CameraView.tsx
  cameraError: { en: 'Could not access the camera. Please ensure permissions are granted and try again.', hi: 'कैमरे तक नहीं पहुंच सका। कृपया सुनिश्चित करें कि अनुमतियाँ दी गई हैं और पुनः प्रयास करें।', ml: 'ക്യാമറ ആക്‌സസ് ചെയ്യാൻ കഴിഞ്ഞില്ല. അനുമതികൾ നൽകിയിട്ടുണ്ടെന്ന് ഉറപ്പുവരുത്തി വീണ്ടും ശ്രമിക്കുക.' },
  cameraClose: { en: 'Close camera', hi: 'कैमरा बंद करें', ml: 'ക്യാമറ അടയ്ക്കുക' },
  cameraCapture: { en: 'Capture photo', hi: 'फोटो खींचे', ml: 'ഫോട്ടോ എടുക്കുക' },

  // ChatBot.tsx
  chatbotTitle: { en: 'AI Health Bot', hi: 'एआई स्वास्थ्य बॉट', ml: 'AI ഹെൽത്ത് ബോട്ട്' },
  chatbotGreeting: { en: "Hi! I'm MyNutriMate, your AI health assistant. How can I help you today?", hi: "नमस्ते! मैं MyNutriMate, आपका AI स्वास्थ्य सहायक हूँ। मैं आज आपकी कैसे मदद कर सकता हूँ?", ml: "ഹായ്! ഞാൻ MyNutriMate, നിങ്ങളുടെ AI ആരോഗ്യ സഹായി. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കും?" },
  chatbotThinking: { en: 'Thinking...', hi: 'सोच रहा हूँ...', ml: 'ചിന്തിക്കുന്നു...' },
  chatbotPlaceholder: { en: 'Ask a health question...', hi: 'एक स्वास्थ्य प्रश्न पूछें...', ml: 'ഒരു ആരോഗ്യ ചോദ്യം ചോദിക്കുക...' },
  chatbotError: { en: 'Sorry, I encountered an error. Please try again.', hi: 'क्षमा करें, मुझे एक त्रुटि मिली। कृपया पुनः प्रयास करें।', ml: 'ക്ഷമിക്കണം, എനിക്കൊരു പിശക് സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.' },
  chatbotStopSpeaking: { en: 'Stop speaking', hi: 'बोलना बंद करो', ml: 'സംസാരിക്കുന്നത് നിർത്തുക' },
  chatbotSpeak: { en: 'Speak message', hi: 'संदेश बोलो', ml: 'സന്ദേശം സംസാരിക്കുക' },
  chatbotToggle: { en: 'Toggle Health Bot', hi: 'हेल्थ बॉट टॉगल करें', ml: 'ഹെൽത്ത് ബോട്ട് ടോഗിൾ ചെയ്യുക' },

  // Dashboard.tsx
  dashboardTitle: { en: 'Today\'s Dashboard', hi: 'आज का डैशबोर्ड', ml: 'ഇന്നത്തെ ഡാഷ്ബോർഡ്' },
  dashboardGreeting: { en: 'Hello {name}, let\'s check your progress!', hi: 'नमस्ते {name}, आइए आपकी प्रगति देखें!', ml: 'ഹലോ {name}, നിങ്ങളുടെ പുരോഗതി പരിശോധിക്കാം!' },
  dashboardScanFood: { en: 'Scan Food or Label', hi: 'भोजन या लेबल स्कैन करें', ml: 'ഭക്ഷണമോ ലേബലോ സ്കാൻ ചെയ്യുക' },
  dashboardAnalyzePrescription: { en: 'Analyze Prescription', hi: 'नुस्खे का विश्लेषण करें', ml: 'കുറിപ്പടി വിശകലനം ചെയ്യുക' },
  dashboardDoctorNotes: { en: 'Doctor\'s Notes', hi: 'डॉक्टर के नोट्स', ml: 'ഡോക്ടറുടെ കുറിപ്പുകൾ' },
  dashboardNoteFrom: { en: 'Note from Dr. {name}', hi: 'डॉ. {name} का नोट', ml: 'ഡോ. {name}ൽ നിന്നുള്ള കുറിപ്പ്' },
  dashboardBmi: { en: 'Body Mass Index (BMI)', hi: 'बॉडी मास इंडेक्स (बीएमआई)', ml: 'ബോഡി മാസ് ഇൻഡക്സ് (ബിഎംഐ)' },
  dashboardEnterBmi: { en: 'Enter height & weight in profile.', hi: 'प्रोफ़ाइल में ऊंचाई और वजन दर्ज करें।', ml: 'പ്രൊഫൈലിൽ ഉയരവും ഭാരവും നൽകുക.' },
  dashboardCalories: { en: 'Calories', hi: 'कैलोरी', ml: 'കലോറി' },
  dashboardLoadingGoals: { en: 'Loading goals...', hi: 'लक्ष्य लोड हो रहे हैं...', ml: 'ലക്ഷ്യങ്ങൾ ലോഡ് ചെയ്യുന്നു...' },
  dashboardMacros: { en: 'Macronutrients', hi: 'मैक्रोन्यूट्रिएंट्स', ml: 'മാക്രോ ന്യൂട്രിയന്റുകൾ' },
  dashboardLoadingMacros: { en: 'Loading your personalized macro goals...', hi: 'आपके व्यक्तिगत मैक्रो लक्ष्य लोड हो रहे हैं...', ml: 'നിങ്ങളുടെ വ്യക്തിഗത മാക്രോ ലക്ഷ്യങ്ങൾ ലോഡ് ചെയ്യുന്നു...' },
  dashboardDailyLimits: { en: 'Daily Limits', hi: 'दैनिक सीमाएं', ml: 'ദൈനംദിന പരിധികൾ' },
  dashboardAiTip: { en: 'AI Health Tip', hi: 'एआई स्वास्थ्य टिप', ml: 'AI ആരോഗ്യ ടിപ്പ്' },
  dashboardAiMealSuggestion: { en: 'AI Meal Suggestion', hi: 'एआई भोजन सुझाव', ml: 'AI ഭക്ഷണ നിർദ്ദേശം' },
  dashboardLogFirstMeal: { en: 'Log Your First Meal!', hi: 'अपना पहला भोजन लॉग करें!', ml: 'നിങ്ങളുടെ ആദ്യത്തെ ഭക്ഷണം ലോഗ് ചെയ്യുക!' },
  dashboardGetInsights: { en: 'Add a meal to get personalized health insights from our AI.', hi: 'हमारे AI से व्यक्तिगत स्वास्थ्य जानकारी प्राप्त करने के लिए एक भोजन जोड़ें।', ml: 'ഞങ്ങളുടെ AI-ൽ നിന്ന് വ്യക്തിഗത ആരോഗ്യ വിവരങ്ങൾ ലഭിക്കാൻ ഒരു ഭക്ഷണം ചേർക്കുക.' },
  dashboardGeneratingTip: { en: 'Generating a new tip...', hi: 'एक नई टिप बना रहा है...', ml: 'ഒരു പുതിയ ടിപ്പ് ഉണ്ടാക്കുന്നു...' },
  dashboardThinkingMeal: { en: 'Thinking of a tasty meal...', hi: 'एक स्वादिष्ट भोजन के बारे में सोच रहा है...', ml: 'രുചികരമായ ഒരു ഭക്ഷണത്തെക്കുറിച്ച് ചിന്തിക്കുന്നു...' },
  dashboardWhyThisMeal: { en: 'Why this meal?', hi: 'यह भोजन क्यों?', ml: 'എന്തുകൊണ്ട് ഈ ഭക്ഷണം?' },
  dashboardSuggestMeal: { en: 'Suggest a Meal', hi: 'एक भोजन सुझाएं', ml: 'ഒരു ഭക്ഷണം നിർദ്ദേശിക്കുക' },
  dashboardSuggestAnother: { en: 'Suggest Another Meal', hi: 'दूसरा भोजन सुझाएं', ml: 'മറ്റൊരു ഭക്ഷണം നിർദ്ദേശിക്കുക' },
  dashboardGetSuggestion: { en: 'Click the button to get an AI-powered suggestion for your next meal based on your goals and health profile.', hi: 'अपने लक्ष्यों और स्वास्थ्य प्रोफ़ाइल के आधार पर अपने अगले भोजन के लिए AI-संचालित सुझाव प्राप्त करने के लिए बटन पर क्लिक करें।', ml: 'നിങ്ങളുടെ ലക്ഷ്യങ്ങളും ആരോഗ്യ പ്രൊഫൈലും അടിസ്ഥാനമാക്കി നിങ്ങളുടെ അടുത്ത ഭക്ഷണത്തിനായി ഒരു AI- പവർ നിർദ്ദേശം ലഭിക്കാൻ ബട്ടൺ ക്ലിക്കുചെയ്യുക.' },
  nutrientProtein: { en: 'Protein', hi: 'प्रोटीन', ml: 'പ്രോട്ടീൻ' },
  nutrientCarbs: { en: 'Carbs', hi: 'कार्ब्स', ml: 'കാർബോഹൈഡ്രേറ്റ്' },
  nutrientFat: { en: 'Fat', hi: 'वसा', ml: 'കൊഴുപ്പ്' },
  nutrientSugar: { en: 'Sugar', hi: 'चीनी', ml: 'പഞ്ചസാര' },
  nutrientSodium: { en: 'Sodium', hi: 'सोडियम', ml: 'സോഡിയം' },
  
  // DoctorDashboard.tsx
  doctorDashboardNoData: { en: 'No data logged recently.', hi: 'हाल ही में कोई डेटा लॉग नहीं किया गया।', ml: 'അടുത്തിടെ ഡാറ്റയൊന്നും ലോഗ് ചെയ്തിട്ടില്ല.' },
  doctorDashboardHintLow: { en: 'Intake is significantly below goal.', hi: 'सेवन लक्ष्य से काफी नीचे है।', ml: 'ലക്ഷ്യത്തേക്കാൾ വളരെ കുറവാണ് കഴിക്കുന്നത്.' },
  doctorDashboardHintHigh: { en: 'Intake is significantly above goal.', hi: 'सेवन लक्ष्य से काफी ऊपर है।', ml: 'ലക്ഷ്യത്തേക്കാൾ വളരെ കൂടുതലാണ് കഴിക്കുന്നത്.' },
  doctorDashboardHintNormal: { en: 'Intake is near goal.', hi: 'सेवन लक्ष्य के करीब है।', ml: 'ലക്ഷ്യത്തിനടുത്താണ് കഴിക്കുന്നത്.' },
  doctorDashboardCalorieStatus: { en: 'Calorie Status', hi: 'कैलोरी स्थिति', ml: 'കലോറി നില' },
  doctorDashboardInactiveHint: { en: 'User has not logged in over 3 days.', hi: 'उपयोगकर्ता ने 3 दिनों से अधिक समय से लॉग इन नहीं किया है।', ml: 'ഉപയോക്താവ് 3 ദിവസമായി ലോഗിൻ ചെയ്തിട്ടില്ല.' },
  doctorDashboardBmiHint: { en: 'BMI: {status}', hi: 'बीएमआई: {status}', ml: 'ബിഎംഐ: {status}' },
  doctorDashboardUnnamed: { en: 'Unnamed Client', hi: 'अनाम क्लाइंट', ml: 'പേരില്ലാത്ത ക്ലയിന്റ്' },
  doctorDashboardManage: { en: 'Manage Patient', hi: 'रोगी प्रबंधित करें', ml: 'രോഗിയെ നിയന്ത്രിക്കുക' },
  doctorDashboardTitle: { en: 'Doctor Dashboard', hi: 'डॉक्टर डैशबोर्ड', ml: 'ഡോക്ടർ ഡാഷ്ബോർഡ്' },
  doctorDashboardSubtitle: { en: 'Manage and monitor your connected patients.', hi: 'अपने जुड़े हुए रोगियों का प्रबंधन और निगरानी करें।', ml: 'നിങ്ങളുടെ കണക്റ്റുചെയ്‌ത രോഗികളെ നിയന്ത്രിക്കുകയും നിരീക്ഷിക്കുകയും ചെയ്യുക.' },
  doctorDashboardExport: { en: 'Export Patient Data', hi: 'रोगी डेटा निर्यात करें', ml: 'രോഗിയുടെ ഡാറ്റ കയറ്റുമതി ചെയ്യുക' },
  doctorDashboardExportEmpty: { en: 'No patient data to export.', hi: 'निर्यात करने के लिए कोई रोगी डेटा नहीं है।', ml: 'കയറ്റുമതി ചെയ്യാൻ രോഗിയുടെ ഡാറ്റയില്ല.' },
  doctorDashboardCodeTitle: { en: 'Your Unique Doctor Code', hi: 'आपका अद्वितीय डॉक्टर कोड', ml: 'നിങ്ങളുടെ തനതായ ഡോക്ടർ കോഡ്' },
  doctorDashboardCodeSubtitle: { en: 'Share this code with your patients to connect.', hi: 'जुड़ने के लिए इस कोड को अपने रोगियों के साथ साझा करें।', ml: 'ബന്ധിപ്പിക്കുന്നതിന് ഈ കോഡ് നിങ്ങളുടെ രോഗികളുമായി പങ്കിടുക.' },
  doctorDashboardCopyCode: { en: 'Copy code', hi: 'कोड कॉपी करें', ml: 'കോഡ് പകർത്തുക' },
  doctorDashboardAllPatients: { en: 'All Patients ({count})', hi: 'सभी रोगी ({count})', ml: 'എല്ലാ രോഗികളും ({count})' },
  doctorDashboardNoPatients: { en: 'No patients are connected yet. Share your Doctor Code to get started.', hi: 'अभी तक कोई रोगी नहीं जुड़ा है। शुरू करने के लिए अपना डॉक्टर कोड साझा करें।', ml: 'രോഗികളാരും ഇതുവരെ ബന്ധിപ്പിച്ചിട്ടില്ല. ആരംഭിക്കുന്നതിന് നിങ്ങളുടെ ഡോക്ടർ കോഡ് പങ്കിടുക.' },

  // DoctorProfilePage.tsx
  doctorProfileTitle: { en: 'My Doctor Profile', hi: 'मेरा डॉक्टर प्रोफ़ाइल', ml: 'എന്റെ ഡോക്ടർ പ്രൊഫൈൽ' },
  doctorProfileSubtitle: { en: 'View and update your professional information.', hi: 'अपनी पेशेवर जानकारी देखें और अपडेट करें।', ml: 'നിങ്ങളുടെ പ്രൊഫഷണൽ വിവരങ്ങൾ കാണുക, അപ്ഡേറ്റ് ചെയ്യുക.' },
  doctorProfilePhonePlaceholder: { en: 'Your contact number', hi: 'आपका संपर्क नंबर', ml: 'നിങ്ങളുടെ കോൺടാക്റ്റ് നമ്പർ' },

  // GroceryList.tsx
  groceryStarsHint: { en: '{stars}/5 Health Stars', hi: '{stars}/5 स्वास्थ्य सितारे', ml: '{stars}/5 ആരോഗ്യ നക്ഷത്രങ്ങൾ' },
  groceryCaloriesHint: { en: '{calories} calories', hi: '{calories} कैलोरी', ml: '{calories} കലോറി' },
  groceryTitle: { en: 'My Grocery List', hi: 'मेरी किराना सूची', ml: 'എന്റെ പലചരക്ക് ലിസ്റ്റ്' },
  grocerySubtitle: { en: 'Manage your shopping list for healthier choices.', hi: 'स्वस्थ विकल्पों के लिए अपनी खरीदारी सूची प्रबंधित करें।', ml: 'ആരോഗ്യകരമായ തിരഞ്ഞെടുപ്പുകൾക്കായി നിങ്ങളുടെ ഷോപ്പിംഗ് ലിസ്റ്റ് നിയന്ത്രിക്കുക.' },
  groceryBackToScanner: { en: 'Back to Scanner', hi: 'स्कैनर पर वापस जाएं', ml: 'സ്കാനറിലേക്ക് മടങ്ങുക' },
  groceryClearPurchased: { en: 'Clear Purchased', hi: 'खरीदे गए साफ़ करें', ml: 'വാങ്ങിയവ മായ്‌ക്കുക' },
  groceryClearConfirm: { en: 'Are you sure you want to clear all purchased items from the list?', hi: 'क्या आप वाकई सूची से सभी खरीदे गए आइटम साफ़ करना चाहते हैं?', ml: 'ലിസ്റ്റിൽ നിന്ന് വാങ്ങിയ എല്ലാ ഇനങ്ങളും മായ്ക്കാൻ നിങ്ങൾ ആഗ്രഹിക്കുന്നുവെന്ന് ഉറപ്പാണോ?' },
  groceryUpdateError: { en: 'Failed to update item status. Please try again.', hi: 'आइटम स्थिति अपडेट करने में विफल। कृपया पुनः प्रयास करें।', ml: 'ഇനത്തിന്റെ നില അപ്‌ഡേറ്റ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.' },
  groceryClearError: { en: 'Failed to clear items. Please try again.', hi: 'आइटम साफ़ करने में विफल। कृपया पुनः प्रयास करें।', ml: 'ഇനങ്ങൾ മായ്ക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.' },
  groceryEmpty: { en: 'Your grocery list is empty.', hi: 'आपकी किराना सूची खाली है।', ml: 'നിങ്ങളുടെ പലചരക്ക് ലിസ്റ്റ് ശൂന്യമാണ്.' },
  groceryScanToStart: { en: 'Scan a product to get started!', hi: 'शुरू करने के लिए एक उत्पाद स्कैन करें!', ml: 'ആരംഭിക്കാൻ ഒരു ഉൽപ്പന്നം സ്കാൻ ചെയ്യുക!' },

  // ImageUploader.tsx
  uploaderDropError: { en: 'Please drop an image file.', hi: 'कृपया एक छवि फ़ाइल ड्रॉप करें।', ml: 'ദയവായി ഒരു ഇമേജ് ഫയൽ ഡ്രോപ്പ് ചെയ്യുക.' },
  uploaderClick: { en: 'Click to upload', hi: 'अपलोड करने के लिए क्लिक करें', ml: 'അപ്‌ലോഡ് ചെയ്യാൻ ക്ലിക്കുചെയ്യുക' },
  uploaderDrag: { en: 'or drag and drop', hi: 'या खींचें और छोड़ें', ml: 'അല്ലെങ്കിൽ വലിച്ചിടുക' },
  uploaderFormats: { en: 'PNG, JPG, GIF up to 10MB', hi: 'पीएनजी, जेपीजी, जीआईएफ 10 एमबी तक', ml: 'PNG, JPG, GIF 10MB വരെ' },
  uploaderOr: { en: 'OR', hi: 'या', ml: 'അഥവാ' },
  uploaderCamera: { en: 'Use Camera', hi: 'कैमरे का उपयोग करें', ml: 'ക്യാമറ ഉപയോഗിക്കുക' },

  // LabelAnalysisDisplay.tsx
  labelServingSize: { en: 'Serving Size: ', hi: 'सेवारत आकार: ', ml: 'വിളമ്പുന്ന വലുപ്പം: ' },
  labelExpiredTitle: { en: 'Product Expired', hi: 'उत्पाद की समय सीमा समाप्त', ml: 'ഉൽപ്പന്നം കാലഹരണപ്പെട്ടു' },
  labelExpiredMessage: { en: 'This product expired on {date}. It is not recommended for consumption.', hi: 'यह उत्पाद {date} को समाप्त हो गया। इसका सेवन करने की अनुशंसा नहीं की जाती है।', ml: 'ഈ ഉൽപ്പന്നം {date}-ന് കാലഹരണപ്പെട്ടു. ഇത് ഉപഭോഗത്തിന് ശുപാർശ ചെയ്യുന്നില്ല.' },
  safetyVerdictSafe: { en: 'Safe For You', hi: 'आपके लिए सुरक्षित', ml: 'നിങ്ങൾക്ക് സുരക്ഷിതം' },
  safetyVerdictRisky: { en: 'Risky For You', hi: 'आपके लिए जोखिम भरा', ml: 'നിങ്ങൾക്ക് അപകടകരം' },
  labelAddToDiary: { en: 'Add to Diary', hi: 'डायरी में जोड़ें', ml: 'ഡയറിയിലേക്ക് ചേർക്കുക' },
  labelAddToGrocery: { en: 'Add to Grocery List', hi: 'किराना सूची में जोड़ें', ml: 'പലചരക്ക് ലിസ്റ്റിലേക്ക് ചേർക്കുക' },
  labelAddSpoiledError: { en: 'Cannot add spoiled food.', hi: 'खराब भोजन नहीं जोड़ सकते।', ml: 'കേടായ ഭക്ഷണം ചേർക്കാൻ കഴിയില്ല.' },
  labelAddExpiredError: { en: 'Cannot add expired food.', hi: 'समाप्त हो चुका भोजन नहीं जोड़ सकते।', ml: 'കാലഹരണപ്പെട്ട ഭക്ഷണം ചേർക്കാൻ കഴിയില്ല.' },
  labelAnalyzeNew: { en: 'Analyze New Item', hi: 'नई वस्तु का विश्लेषण करें', ml: 'പുതിയ ഇനം വിശകലനം ചെയ്യുക' },
  labelHealthAssessment: { en: 'General Health Assessment', hi: 'सामान्य स्वास्थ्य मूल्यांकन', ml: 'പൊതു ആരോഗ്യ വിലയിരുത്തൽ' },
  labelStarsOutOf5: { en: '{stars} / 5.0', hi: '{stars} / 5.0', ml: '{stars} / 5.0' },
  labelNutritionalBreakdown: { en: 'Nutritional Breakdown (Serving Size {size}g)', hi: 'पोषण संबंधी विवरण (सेवारत आकार {size} ग्राम)', ml: 'പോഷക വിവരണം (വിളമ്പുന്ന വലുപ്പം {size}g)' },
  labelMicronutrients: { en: 'Micronutrient Spotlight', hi: 'माइक्रोन्यूट्रिएंट स्पॉटलाइट', ml: 'സൂക്ഷ്മ പോഷക ശ്രദ്ധ' },

  // MedicalFiles.tsx
  filesDoctorTitle: { en: "{name}'s Medical Files", hi: "{name} की मेडिकल फाइलें", ml: "{name}യുടെ മെഡിക്കൽ ഫയലുകൾ" },
  filesPatientTitle: { en: 'My Medical Files', hi: 'मेरी मेडिकल फाइलें', ml: 'എന്റെ മെഡിക്കൽ ഫയലുകൾ' },
  filesSubtitle: { en: 'A secure place for your important health documents.', hi: 'आपके महत्वपूर्ण स्वास्थ्य दस्तावेजों के लिए एक सुरक्षित स्थान।', ml: 'നിങ്ങളുടെ പ്രധാനപ്പെട്ട ആരോഗ്യ രേഖകൾക്കായി ഒരു സുരക്ഷിത സ്ഥലം.' },
  filesUploadTitle: { en: 'Upload a New Document', hi: 'एक नया दस्तावेज़ अपलोड करें', ml: 'ഒരു പുതിയ പ്രമാണം അപ്‌ലോഡ് ചെയ്യുക' },
  filesUploading: { en: 'Uploading...', hi: 'अपलोड हो रहा है...', ml: 'അപ്‌ലോഡ് ചെയ്യുന്നു...' },
  filesClickToSelect: { en: 'Click to select a file', hi: 'एक फ़ाइल चुनने के लिए क्लिक करें', ml: 'ഒരു ഫയൽ തിരഞ്ഞെടുക്കാൻ ക്ലിക്കുചെയ്യുക' },
  filesFormats: { en: 'PDF, PNG, JPG, XLSX, XLS up to 5MB', hi: 'पीडीएफ, पीएनजी, जेपीजी, एक्सएलएसएक्स, एक्सएलएस 5 एमबी तक', ml: 'PDF, PNG, JPG, XLSX, XLS 5MB വരെ' },
  filesInvalidType: { en: 'Invalid file type. Please upload a PDF, image (PNG, JPG), or Excel file.', hi: 'अमान्य फ़ाइल प्रकार। कृपया एक पीडीएफ, छवि (पीएनजी, जेपीजी), या एक्सेल फ़ाइल अपलोड करें।', ml: 'അസാധുവായ ഫയൽ തരം. ദയവായി ഒരു PDF, ചിത്രം (PNG, JPG), അല്ലെങ്കിൽ Excel ഫയൽ അപ്‌ലോഡ് ചെയ്യുക.' },
  filesTooLarge: { en: 'File is too large. Please upload files under 5MB.', hi: 'फ़ाइल बहुत बड़ी है। कृपया 5 एमबी से कम की फाइलें अपलोड करें।', ml: 'ഫയൽ വളരെ വലുതാണ്. ദയവായി 5MB-യിൽ താഴെയുള്ള ഫയലുകൾ അപ്‌ലോഡ് ചെയ്യുക.' },
  filesStoredCount: { en: 'Stored Documents ({count})', hi: 'संग्रहीत दस्तावेज़ ({count})', ml: 'സംഭരിച്ച പ്രമാണങ്ങൾ ({count})' },
  filesConfigError: { en: "Configuration Error: The 'medical-documents' storage bucket is missing. A developer must create this in the Supabase project dashboard. Please see the setup instructions in README.md.", hi: "कॉन्फ़िगरेशन त्रुटि: 'medical-documents' स्टोरेज बकेट गायब है। एक डेवलपर को इसे Supabase प्रोजेक्ट डैशबोर्ड में बनाना होगा। कृपया README.md में सेटअप निर्देश देखें।", ml: "കോൺഫിഗറേഷൻ പിശക്: 'medical-documents' സ്റ്റോറേജ് ബക്കറ്റ് കാണുന്നില്ല. ഒരു ഡെവലപ്പർ ഇത് Supabase പ്രോജക്റ്റ് ഡാഷ്‌ബോർഡിൽ സൃഷ്‌ടിക്കണം. ദയവായി README.md-ലെ സജ്ജീകരണ നിർദ്ദേശങ്ങൾ കാണുക." },
  filesEmptyDoctor: { en: 'This patient has not uploaded any documents.', hi: 'इस रोगी ने कोई दस्तावेज़ अपलोड नहीं किया है।', ml: 'ഈ രോഗി ഒരു പ്രമാണവും അപ്‌ലോഡ് ചെയ്തിട്ടില്ല.' },
  filesEmptyPatient: { en: 'You have not uploaded any documents yet.', hi: 'आपने अभी तक कोई दस्तावेज़ अपलोड नहीं किया है।', ml: 'നിങ്ങൾ ഇതുവരെ ഒരു പ്രമാണവും അപ്‌ലോഡ് ചെയ്തിട്ടില്ല.' },
  filesView: { en: 'View File', hi: 'फ़ाइल देखें', ml: 'ഫയൽ കാണുക' },
  filesDownload: { en: 'Download File', hi: 'फ़ाइल डाउनलोड करें', ml: 'ഫയൽ ഡൗൺലോഡ് ചെയ്യുക' },
  filesDelete: { en: 'Delete File', hi: 'फ़ाइल हटाएं', ml: 'ഫയൽ ഇല്ലാതാക്കുക' },
  filesDeleteConfirm: { en: 'Are you sure you want to delete {fileName}? This cannot be undone.', hi: 'क्या आप वाकई {fileName} को हटाना चाहते हैं? यह पूर्ववत नहीं किया जा सकता।', ml: '{fileName} ഇല്ലാതാക്കാൻ നിങ്ങൾ ആഗ്രഹിക്കുന്നുവെന്ന് ഉറപ്പാണോ? ഇത് പഴയപടിയാക്കാനാവില്ല.' },
  filesPdfViewerTitle: { en: 'PDF Viewer', hi: 'पीडीएफ व्यूअर', ml: 'PDF വ്യൂവർ' },
  filesImageAlt: { en: 'Medical document', hi: 'चिकित्सा दस्तावेज़', ml: 'മെഡിക്കൽ പ്രമാണം' },
  filesCloseViewer: { en: 'Close viewer', hi: 'व्यूअर बंद करें', ml: 'വ്യൂവർ അടയ്ക്കുക' },

  // NutritionDisplay.tsx
  nutritionEstWeight: { en: 'Estimated Weight: ', hi: 'अनुमानित वजन: ', ml: 'കണക്കാക്കിയ ഭാരം: ' },
  nutritionAddSpoiledError: { en: 'Cannot add spoiled food to diary.', hi: 'खराब भोजन डायरी में नहीं जोड़ सकते।', ml: 'കേടായ ഭക്ഷണം ഡയറിയിൽ ചേർക്കാൻ കഴിയില്ല.' },
  nutritionCancelRefine: { en: 'Cancel Refinement', hi: 'शोधन रद्द करें', ml: 'പരിഷ്ക്കരണം റദ്ദാക്കുക' },
  nutritionRefine: { en: 'Refine Analysis', hi: 'विश्लेषण परिष्कृत करें', ml: 'വിശകലനം പരിഷ്ക്കരിക്കുക' },
  nutritionAnalyzeNew: { en: 'Analyze New Meal', hi: 'नए भोजन का विश्लेषण करें', ml: 'പുതിയ ഭക്ഷണം വിശകലനം ചെയ്യുക' },
  nutritionBreakdown: { en: 'Nutritional Breakdown', hi: 'पोषण संबंधी विवरण', ml: 'പോഷക വിവരണം' },

  // PatientManagementModal.tsx
  modalPatientNote: { en: 'Patient Note', hi: 'रोगी नोट', ml: 'രോഗിയുടെ കുറിപ്പ്' },
  modalNotePlaceholder: { en: "Add a note for your patient... This will appear on their dashboard.", hi: "अपने रोगी के लिए एक नोट जोड़ें... यह उनके डैशबोर्ड पर दिखाई देगा।", ml: "നിങ്ങളുടെ രോഗിക്കായി ഒരു കുറിപ്പ് ചേർക്കുക... ഇത് അവരുടെ ഡാഷ്‌ബോർഡിൽ ദൃശ്യമാകും." },
  modalSaveErrorHint: { en: 'If this persists, your database may be missing required security policies. Please check the README.md file.', hi: 'यदि यह बना रहता है, तो आपके डेटाबेस में आवश्यक सुरक्षा नीतियां गायब हो सकती हैं। कृपया README.md फ़ाइल देखें।', ml: 'ഇത് തുടരുകയാണെങ്കിൽ, നിങ്ങളുടെ ഡാറ്റാബേസിൽ ആവശ്യമായ സുരക്ഷാ നയങ്ങൾ നഷ്‌ടമായേക്കാം. ദയവായി README.md ഫയൽ പരിശോധിക്കുക.' },
  modalSafeFoods: { en: 'Safe Foods', hi: 'सुरक्षित खाद्य पदार्थ', ml: 'സുരക്ഷിതമായ ഭക്ഷണങ്ങൾ' },
  modalFoodName: { en: 'Food Name*', hi: 'भोजन का नाम*', ml: 'ഭക്ഷണത്തിന്റെ പേര്*' },
  modalBrand: { en: 'Brand (Optional)', hi: 'ब्रांड (वैकल्पिक)', ml: 'ബ്രാൻഡ് (ഓപ്ഷണൽ)' },
  modalRestrictedFoods: { en: 'Restricted Foods', hi: 'प्रतिबंधित खाद्य पदार्थ', ml: 'നിയന്ത്രിത ഭക്ഷണങ്ങൾ' },
  modalReason: { en: 'Reason*', hi: 'कारण*', ml: 'കാരണം*' },
  modalTabNote: { en: 'Patient Note', hi: 'रोगी नोट', ml: 'രോഗിയുടെ കുറിപ്പ്' },
  modalTabFood: { en: 'Food Lists', hi: 'खाद्य सूचियाँ', ml: 'ഭക്ഷണ ലിസ്റ്റുകൾ' },
  modalTabHistory: { en: 'History', hi: 'इतिहास', ml: 'ചരിത്രം' },
  modalTabFiles: { en: 'Files', hi: 'फ़ाइलें', ml: 'ഫയലുകൾ' },
  modalDisconnect: { en: 'Disconnect from Patient', hi: 'रोगी से डिस्कनेक्ट करें', ml: 'രോഗിയിൽ നിന്ന് വിച്ഛേദിക്കുക' },
  modalDisconnectConfirm: { en: 'Are you sure you want to disconnect from this patient?', hi: 'क्या आप वाकई इस रोगी से डिस्कनेक्ट करना चाहते हैं?', ml: 'ഈ രോഗിയിൽ നിന്ന് വിച്ഛേദിക്കാൻ നിങ്ങൾ ആഗ്രഹിക്കുന്നുവെന്ന് ഉറപ്പാണോ?' },

  // PrescriptionAnalysis.tsx
  prescriptionTitle: { en: 'Analyze Prescription', hi: 'नुस्खे का विश्लेषण करें', ml: 'കുറിപ്പടി വിശകലനം ചെയ്യുക' },
  prescriptionSubtitle: { en: 'Upload a photo of your prescription or paste the text below. The AI will extract key information and help you update your medical profile.', hi: 'अपने नुस्खे की एक तस्वीर अपलोड करें या नीचे दिए गए टेक्स्ट को पेस्ट करें। एआई महत्वपूर्ण जानकारी निकालेगा और आपको अपनी मेडिकल प्रोफ़ाइल अपडेट करने में मदद करेगा।', ml: 'നിങ്ങളുടെ കുറിപ്പടിയുടെ ഒരു ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക അല്ലെങ്കിൽ താഴെയുള്ള വാചകം ഒട്ടിക്കുക. AI പ്രധാന വിവരങ്ങൾ എക്‌സ്‌ട്രാക്റ്റുചെയ്യുകയും നിങ്ങളുടെ മെഡിക്കൽ പ്രൊഫൈൽ അപ്‌ഡേറ്റ് ചെയ്യാൻ സഹായിക്കുകയും ചെയ്യും.' },
  prescriptionUploadOrPaste: { en: 'Upload or Paste', hi: 'अपलोड या पेस्ट करें', ml: 'അപ്‌ലോഡ് ചെയ്യുക അല്ലെങ്കിൽ ഒട്ടിക്കുക' },
  prescriptionTextPlaceholder: { en: 'Or, paste your prescription text here...', hi: 'या, अपना नुस्खा टेक्स्ट यहाँ पेस्ट करें...', ml: 'അല്ലെങ്കിൽ, നിങ്ങളുടെ കുറിപ്പടി വാചകം ഇവിടെ ഒട്ടിക്കുക...' },
  prescriptionAnalyzeText: { en: 'Analyze Text', hi: 'टेक्स्ट का विश्लेषण करें', ml: 'വാചകം വിശകലനം ചെയ്യുക' },
  prescriptionAiResult: { en: 'AI Analysis Result', hi: 'एआई विश्लेषण परिणाम', ml: 'AI വിശകലന ഫലം' },
  prescriptionAnalyzing: { en: 'Analyzing...', hi: 'विश्लेषण हो रहा है...', ml: 'വിശകലനം ചെയ്യുന്നു...' },
  prescriptionDiagnoses: { en: 'Diagnoses Identified', hi: 'पहचाने गए निदान', ml: 'തിരിച്ചറിഞ്ഞ രോഗനിർണയങ്ങൾ' },
  prescriptionMedications: { en: 'Medications Identified', hi: 'पहचानी गई दवाएं', ml: 'തിരിച്ചറിഞ്ഞ മരുന്നുകൾ' },
  prescriptionNoneFound: { en: 'None found.', hi: 'कोई नहीं मिला।', ml: 'ഒന്നും കണ്ടെത്തിയില്ല.' },
  prescriptionSaveToHistory: { en: 'Save to My Medical History', hi: 'मेरे मेडिकल इतिहास में सेव करें', ml: 'എന്റെ മെഡിക്കൽ ചരിത്രത്തിലേക്ക് സംരക്ഷിക്കുക' },
  prescriptionSaveSuccess: { en: 'Your medical history has been updated!', hi: 'आपका मेडिकल इतिहास अपडेट कर दिया गया है!', ml: 'നിങ്ങളുടെ മെഡിക്കൽ ചരിത്രം അപ്‌ഡേറ്റ് ചെയ്തു!' },
  prescriptionResultsPlaceholder: { en: 'Your analysis results will appear here.', hi: 'आपके विश्लेषण परिणाम यहाँ दिखाई देंगे।', ml: 'നിങ്ങളുടെ വിശകലന ഫലങ്ങൾ ഇവിടെ ദൃശ്യമാകും.' },

  // UserProfilePage.tsx
  profileWelcome: { en: "Welcome! Let's set up your profile", hi: 'स्वागत है! आइए आपका प्रोफ़ाइल सेट करें', ml: 'സ്വാഗതം! നിങ്ങളുടെ പ്രൊഫൈൽ സജ്ജമാക്കാം' },
  profileTitle: { en: 'My Profile', hi: 'मेरी प्रोफ़ाइल', ml: 'എന്റെ പ്രൊഫൈൽ' },
  profileWelcomeSubtitle: { en: 'This information helps us personalize your health advice.', hi: 'यह जानकारी हमें आपकी स्वास्थ्य सलाह को व्यक्तिगत बनाने में मदद करती है।', ml: 'ഈ വിവരം നിങ്ങളുടെ ആരോഗ്യ ഉപദേശം വ്യക്തിഗതമാക്കാൻ ഞങ്ങളെ സഹായിക്കുന്നു.' },
  profileUpdateSubtitle: { en: 'Keep your information up to date for the best advice.', hi: 'सर्वोत्तम सलाह के लिए अपनी जानकारी अद्यतित रखें।', ml: 'മികച്ച ഉപദേശത്തിനായി നിങ്ങളുടെ വിവരങ്ങൾ അപ്ഡേറ്റായി സൂക്ഷിക്കുക.' },
  profilePersonalDetails: { en: 'Personal Details', hi: 'व्यक्तिगत विवरण', ml: 'വ്യക്തിഗത വിവരങ്ങൾ' },
  profileFullNamePlaceholder: { en: 'Your full name', hi: 'आपका पूरा नाम', ml: 'നിങ്ങളുടെ മുഴുവൻ പേര്' },
  profileUsernamePlaceholder: { en: 'A unique username', hi: 'एक अद्वितीय उपयोगकर्ता नाम', ml: 'ഒരു തനതായ ഉപയോക്തൃനാമം' },
  profilePhonePlaceholder: { en: 'Your 10-digit mobile number', hi: 'आपका 10-अंकीय मोबाइल नंबर', ml: 'നിങ്ങളുടെ 10 അക്ക മൊബൈൽ നമ്പർ' },
  profileDob: { en: 'Date of Birth', hi: 'जन्म की तारीख', ml: 'ജനന തീയതി' },
  profileGender: { en: 'Gender', hi: 'लिंग', ml: 'ലിംഗഭേദം' },
  profileHealthMetrics: { en: 'Health Metrics & History', hi: 'स्वास्थ्य मेट्रिक्स और इतिहास', ml: 'ആരോഗ്യ അളവുകളും ചരിത്രവും' },
  profileHeight: { en: 'Height (cm)', hi: 'ऊंचाई (सेमी)', ml: 'ഉയരം (സെ.മീ)' },
  profileHeightPlaceholder: { en: 'e.g., 165', hi: 'उदा., 165', ml: 'ഉദാ., 165' },
  profileWeight: { en: 'Weight (kg)', hi: 'वजन (किग्रा)', ml: 'ഭാരം (കി.ഗ്രാം)' },
  profileWeightPlaceholder: { en: 'e.g., 60', hi: 'उदा., 60', ml: 'ഉദാ., 60' },
  profileLiveBmi: { en: 'Live BMI Calculation', hi: 'लाइव बीएमआई गणना', ml: 'ലൈവ് ബിഎംഐ കണക്കുകൂട്ടൽ' },
  profileEnterBmi: { en: 'Enter height and weight to see BMI.', hi: 'बीएमआई देखने के लिए ऊंचाई और वजन दर्ज करें।', ml: 'ബിഎംഐ കാണുന്നതിന് ഉയരവും ഭാരവും നൽകുക.' },
  profileActivityLevel: { en: 'Activity Level', hi: 'गतिविधि स्तर', ml: 'പ്രവർത്തന നില' },
  profileMedicalHistory: { en: 'Medical History / Conditions', hi: 'चिकित्सा इतिहास / स्थितियाँ', ml: 'മെഡിക്കൽ ചരിത്രം / അവസ്ഥകൾ' },
  profileMedicalHistoryPlaceholder: { en: 'e.g., Diabetes, High Blood Pressure, Allergy to peanuts.', hi: 'उदा., मधुमेह, उच्च रक्तचाप, मूंगफली से एलर्जी।', ml: 'ഉദാ., പ്രമേഹം, ഉയർന്ന രക്തസമ്മർദ്ദം, നിലക്കടലയോട് അലർജി.' },
  profileSaveContinue: { en: 'Save and Continue', hi: 'सहेजें और जारी रखें', ml: 'സേവ് ചെയ്ത് തുടരുക' },
  profileSaveChanges: { en: 'Save Changes', hi: 'बदलाव सहेजें', ml: 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക' },
  profileDoctorConnect: { en: 'Doctor Connect', hi: 'डॉक्टर कनेक्ट', ml: 'ഡോക്ടർ കണക്റ്റ്' },
  profileDoctorConnectSubtitle: { en: 'To get guidance from your doctor, please enter their first name and the unique code they provided to you.', hi: 'अपने डॉक्टर से मार्गदर्शन प्राप्त करने के लिए, कृपया उनका पहला नाम और उनके द्वारा प्रदान किया गया अद्वितीय कोड दर्ज करें।', ml: 'നിങ്ങളുടെ ഡോക്ടറിൽ നിന്ന് മാർഗ്ഗനിർദ്ദേശം ലഭിക്കുന്നതിന്, ദയവായി അവരുടെ പേരും അവർ നൽകിയ തനതായ കോഡും നൽകുക.' },
  profileConnectedWith: { en: 'Connected With:', hi: 'इसके साथ जुड़ा हुआ है:', ml: 'ഇവരുമായി ബന്ധിപ്പിച്ചിരിക്കുന്നു:' },
  profileConnectSuccess: { en: 'Successfully connected! Your Doctor can now view your progress.', hi: 'सफलतापूर्वक कनेक्ट हो गया! आपके डॉक्टर अब आपकी प्रगति देख सकते हैं।', ml: 'വിജയകരമായി ബന്ധിപ്പിച്ചു! നിങ്ങളുടെ ഡോക്ടർക്ക് ഇപ്പോൾ നിങ്ങളുടെ പുരോഗതി കാണാൻ കഴിയും.' },
  profileDisconnectConfirm: { en: 'Are you sure you want to disconnect from this doctor?', hi: 'क्या आप वाकई इस डॉक्टर से डिस्कनेक्ट करना चाहते हैं?', ml: 'ഈ ഡോക്ടറിൽ നിന്ന് വിച്ഛേദിക്കാൻ നിങ്ങൾ ആഗ്രഹിക്കുന്നുവെന്ന് ഉറപ്പാണോ?' },
  profileDisconnect: { en: 'Disconnect', hi: 'डिस्कनेक्ट', ml: 'വിച്ഛേദിക്കുക' },
  profileDoctorFirstName: { en: "Doctor's First Name", hi: 'डॉक्टर का पहला नाम', ml: 'ഡോക്ടറുടെ പേര്' },
  profileDoctorFirstNamePlaceholder: { en: 'e.g., Sunita', hi: 'उदा., सुनीता', ml: 'ഉദാ., സുനിത' },
  profileDoctorCode: { en: "Doctor's Unique Code", hi: 'डॉक्टर का अद्वितीय कोड', ml: 'ഡോക്ടറുടെ തനതായ കോഡ്' },
  profileDoctorCodePlaceholder: { en: 'e.g., AB12CD', hi: 'उदा., AB12CD', ml: 'ഉദാ., AB12CD' },
  profileConnect: { en: 'Connect', hi: 'कनेक्ट करें', ml: 'ബന്ധിപ്പിക്കുക' },
  profileFetchConnectionsError: { en: 'Failed to fetch Doctor connections.', hi: 'डॉक्टर कनेक्शन लाने में विफल।', ml: 'ഡോക്ടർ കണക്ഷനുകൾ ലഭ്യമാക്കുന്നതിൽ പരാജയപ്പെട്ടു.' },
  profileConnectFormError: { en: 'Doctor Code and First Name are required.', hi: 'डॉक्टर कोड और पहला नाम आवश्यक हैं।', ml: 'ഡോക്ടർ കോഡും പേരും ആവശ്യമാണ്.' },
  profileConnectDbError: { en: 'A database error occurred. Please try again later.', hi: 'एक डेटाबेस त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।', ml: 'ഒരു ഡാറ്റാബേസ് പിശക് സംഭവിച്ചു. ദയവായി പിന്നീട് വീണ്ടും ശ്രമിക്കുക.' },
  profileConnectInvalidCode: { en: 'Invalid Doctor Code. Please double-check the code and try again.', hi: 'अमान्य डॉक्टर कोड। कृपया कोड दोबारा जांचें और पुनः प्रयास करें।', ml: 'അസാധുവായ ഡോക്ടർ കോഡ്. ദയവായി കോഡ് രണ്ടുതവണ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.' },
  profileConnectNameMismatch: { en: "The Doctor's first name does not seem to match the provided code. Please verify both details.", hi: "डॉक्टर का पहला नाम दिए गए कोड से मेल नहीं खाता। कृपया दोनों विवरण सत्यापित करें।", ml: "ഡോക്ടറുടെ പേര് നൽകിയ കോഡുമായി പൊരുത്തപ്പെടുന്നതായി തോന്നുന്നില്ല. ദയവായി രണ്ട് വിശദാംശങ്ങളും പരിശോധിക്കുക." },
  profileConnectCheckError: { en: 'Could not verify existing connections due to a database error.', hi: 'डेटाबेस त्रुटि के कारण मौजूदा कनेक्शन सत्यापित नहीं किए जा सके।', ml: 'ഒരു ഡാറ്റാബേസ് പിശക് കാരണം നിലവിലുള്ള കണക്ഷനുകൾ പരിശോധിക്കാൻ കഴിഞ്ഞില്ല.' },
  profileConnectAlreadyConnected: { en: 'You are already connected with this Doctor.', hi: 'आप पहले से ही इस डॉक्टर से जुड़े हुए हैं।', ml: 'നിങ്ങൾ ഇതിനകം ഈ ഡോക്ടറുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു.' },
  profileConnectInsertError: { en: 'Failed to create the connection due to a database error.', hi: 'डेटाबेस त्रुटि के कारण कनेक्शन बनाने में विफल।', ml: 'ഒരു ഡാറ്റാബേസ് പിശക് കാരണം കണക്ഷൻ സൃഷ്ടിക്കുന്നതിൽ പരാജയപ്പെട്ടു.' },
  profileDisconnectError: { en: 'Failed to disconnect.', hi: 'डिस्कनेक्ट करने में विफल।', ml: 'വിച്ഛേദിക്കുന്നതിൽ പരാജയപ്പെട്ടു.' },
  profileGuidelinesTitle: { en: "Doctor's Guidelines", hi: 'डॉक्टर के दिशानिर्देश', ml: 'ഡോക്ടറുടെ മാർഗ്ഗനിർദ്ദേശങ്ങൾ' },
  profileApprovedFoods: { en: 'Approved Foods', hi: 'अनुमोदित खाद्य पदार्थ', ml: 'അംഗീകൃത ഭക്ഷണങ്ങൾ' },
  profileNoApproved: { en: 'No specific foods approved by your doctor yet.', hi: 'अभी तक आपके डॉक्टर द्वारा कोई विशिष्ट खाद्य पदार्थ अनुमोदित नहीं किया गया है।', ml: 'നിങ്ങളുടെ ഡോക്ടർ ഇതുവരെ പ്രത്യേക ഭക്ഷണങ്ങളൊന്നും അംഗീകരിച്ചിട്ടില്ല.' },
  profileRestrictedFoods: { en: 'Restricted Foods', hi: 'प्रतिबंधित खाद्य पदार्थ', ml: 'നിയന്ത്രിത ഭക്ഷണങ്ങൾ' },
  profileNoRestricted: { en: 'No restricted foods from your doctor.', hi: 'आपके डॉक्टर से कोई प्रतिबंधित खाद्य पदार्थ नहीं है।', ml: 'നിങ്ങളുടെ ഡോക്ടറിൽ നിന്ന് നിയന്ത്രിത ഭക്ഷണങ്ങളൊന്നുമില്ല.' },
  profileReason: { en: 'Reason:', hi: 'कारण:', ml: 'കാരണം:' },
  profileBrand: { en: 'Brand:', hi: 'ब्रांड:', ml: 'ബ്രാൻഡ്:' },

  // HistoryView.tsx
  historyBackToList: { en: 'Back to List', hi: 'सूची में वापस', ml: 'ലിസ്റ്റിലേക്ക് മടങ്ങുക' },
  historyPrint: { en: 'Print Report', hi: 'रिपोर्ट प्रिंट करें', ml: 'റിപ്പോർട്ട് പ്രിന്റ് ചെയ്യുക' },
  historyReportTitle: { en: 'Nutrition History Report', hi: 'पोषण इतिहास रिपोर्ट', ml: 'പോഷകാഹാര ചരിത്ര റിപ്പോർട്ട്' },
  historyReportPatient: { en: 'Patient:', hi: 'मरीज:', ml: 'രോഗി:' },
  historyReportDate: { en: 'Report Date:', hi: 'रिपोर्ट दिनांक:', ml: 'റിപ്പോർട്ട് തീയതി:' },
  historyReportGoal: { en: 'Calorie Goal:', hi: 'कैलोरी लक्ष्य:', ml: 'കലോറി ലക്ഷ്യം:' },
  historyPatientHistory: { en: "{name}'s History", hi: "{name} का इतिहास", ml: "{name}യുടെ ചരിത്രം" },
  historyMyHistory: { en: 'My Nutrition History', hi: 'मेरा पोषण इतिहास', ml: 'എന്റെ പോഷകാഹാര ചരിത്രം' },
  historySearchPlaceholder: { en: 'Search in history...', hi: 'इतिहास में खोजें...', ml: 'ചരിത്രത്തിൽ തിരയുക...' },
  historyRisky: { en: 'Risky', hi: 'जोखिम भरा', ml: 'അപകടകരം' },
  historyReason: { en: 'Reason:', hi: 'कारण:', ml: 'കാരണം:' },
  historyNoItems: { en: 'No history items yet. Use the "Log Meal" tab to get started!', hi: 'अभी तक कोई इतिहास आइटम नहीं है। शुरू करने के लिए "भोजन लॉग करें" टैब का उपयोग करें!', ml: 'ഇതുവരെ ചരിത്ര ഇനങ്ങളൊന്നുമില്ല. ആരംഭിക്കുന്നതിന് "ഭക്ഷണം ലോഗ് ചെയ്യുക" ടാബ് ഉപയോഗിക്കുക!' },
  historyNoMatch: { en: 'No history items match your search.', hi: 'कोई भी इतिहास आइटम आपकी खोज से मेल नहीं खाता।', ml: 'നിങ്ങളുടെ തിരയലുമായി പൊരുത്തപ്പെടുന്ന ചരിത്ര ഇനങ്ങളൊന്നുമില്ല.' },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
  languageName: LanguageName;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = localStorage.getItem('app-language');
    return (savedLang && ['en', 'hi', 'ml'].includes(savedLang)) ? savedLang as Language : 'en';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('app-language', lang);
    setLanguageState(lang);
  };

  const t = useCallback((key: string, options?: { [key: string]: string | number }) => {
    const translationSet = translations[key];
    if (!translationSet) {
      console.warn(`Translation key '${key}' not found.`);
      return key;
    }
    let text = translationSet[language] || translationSet['en'];
    if (options) {
        Object.keys(options).forEach(optKey => {
            text = text.replace(`{${optKey}}`, String(options[optKey]));
        });
    }
    return text;
  }, [language]);

  const languageName = useMemo(() => languageNames[language], [language]);

  const value = { language, setLanguage, t, languageName };

  return React.createElement(I18nContext.Provider, { value }, children);
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};