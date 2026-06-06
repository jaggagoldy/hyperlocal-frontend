const fs = require('fs');
const file = 'src/app/vendor/register/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('export default function MyBusinessWizardPage() {', 'export default function VendorRegisterPage() {');

const stateInsertion = `
  const { user, setActiveBusiness, setAuth, token } = useAuthStore();
  
  // Onboarding user details
  const [onboardingToken, setOnboardingToken] = useState<string | null>(null);
  const [isGoogle, setIsGoogle] = useState(false);
  const [personalName, setPersonalName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [personalPassword, setPersonalPassword] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [personalGender, setPersonalGender] = useState('');
  const [personalDob, setPersonalDob] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('onboardingToken');
      const google = urlParams.get('isGoogle') === 'true';
      if (token) setOnboardingToken(token);
      setIsGoogle(google);
    }
  }, []);
`;
content = content.replace('const { user, setActiveBusiness } = useAuthStore();', stateInsertion);

const personalDetailsUI = `
              {onboardingToken && (
                <div className="p-4 bg-zinc-50 rounded-xl space-y-4 mb-6 border border-zinc-200">
                  <h3 className="text-sm font-bold text-zinc-900">Personal Details</h3>
                  {!isGoogle && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-600 uppercase">Your Full Name</label>
                        <input className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm" value={personalName} onChange={e => setPersonalName(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-600 uppercase">Email Address</label>
                        <input className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm" type="email" value={personalEmail} onChange={e => setPersonalEmail(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-600 uppercase">Secure Password</label>
                        <input className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm" type="password" value={personalPassword} onChange={e => setPersonalPassword(e.target.value)} required />
                      </div>
                    </>
                  )}
                  {isGoogle && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-600 uppercase">Phone Number</label>
                      <input className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm" type="tel" value={personalPhone} onChange={e => setPersonalPhone(e.target.value)} required />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-600 uppercase">Gender</label>
                      <select className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm" value={personalGender} onChange={e => setPersonalGender(e.target.value)} required>
                        <option value="" disabled>Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-600 uppercase">Date of Birth</label>
                      <input className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm" type="date" value={personalDob} onChange={e => setPersonalDob(e.target.value)} required />
                    </div>
                  </div>
                </div>
              )}
`;
content = content.replace('<div>\n                <h2 className="text-xl font-black text-zinc-900 mb-4">Select Business Category *</h2>', personalDetailsUI + '              <div>\n                <h2 className="text-xl font-black text-zinc-900 mb-4">Select Business Category *</h2>');

const handleRegisterReplacement = `
  const handleRegister = async () => {
    try {
      setIsSubmitting(true);
      
      let currentToken = token;
      let currentUser = user;

      if (onboardingToken && !token) {
        const onboardPayload: any = {
          onboardingToken,
          address: form.address || form.city,
          gender: personalGender,
          dateOfBirth: personalDob,
        };
        
        if (isGoogle) {
          onboardPayload.phoneNumber = personalPhone;
        } else {
          onboardPayload.name = personalName;
          onboardPayload.email = personalEmail;
          onboardPayload.password = personalPassword;
        }

        const onboardRes = await apiClient.post('/auth/onboard', onboardPayload);
        currentToken = onboardRes.data?.data?.token || onboardRes.data?.token;
        currentUser = onboardRes.data?.data?.user || onboardRes.data?.user;
        
        if (currentToken && currentUser) {
          setAuth(currentToken, currentUser);
          apiClient.defaults.headers.common['Authorization'] = \`Bearer \${currentToken}\`;
        }
      }

      let metaData: any = {};
`;
content = content.replace('  const handleRegister = async () => {\n    try {\n      setIsSubmitting(true);\n      \n      let metaData: any = {};', handleRegisterReplacement);

// Fix the router pushes in handlesuccess to go to /vendor-dashboard instead of workspace since they just registered
content = content.replaceAll("router.push('/vendor-dashboard/workspace')", "router.push('/vendor-dashboard')");
content = content.replaceAll("router.push('/vendor-dashboard/workspace/management/my-business')", "router.push('/vendor-dashboard')");

fs.writeFileSync(file, content);
console.log('Patched VendorRegisterPage');
