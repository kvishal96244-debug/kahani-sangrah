# Hindi Story Website

एक पूर्ण विकसित हिंदी कहानी वेबसाइट जिसमें एडमिन पैनल भी शामिल है।

## विशेषताएँ

### User Side:
- कहानियों की सूची
- श्रेणी के अनुसार फिल्टर
- खोज सुविधा
- कहानी पढ़ने के लिए मोडल
- लाइक और शेयर बटन

### Admin Panel:
- सुरक्षित लॉगिन
- नई कहानी जोड़ें/संपादित करें
- कहानियाँ डिलीट करें
- वेबसाइट विश्लेषण
- सेटिंग्स प्रबंधन

## तकनीकी स्टैक
- HTML5
- CSS3 (Flexbox, Grid, Animations)
- Vanilla JavaScript
- LocalStorage for data persistence
- Chart.js for analytics
- Quill Editor for rich text

## सेटअप निर्देश

### विकल्प 1: सीधे उपयोग करें
1. सभी फाइलें एक फोल्डर में डाउनलोड करें
2. `index.html` को ब्राउज़र में खोलें
3. एडमिन पैनल के लिए: `admin.html` खोलें

### डिफ़ॉल्ट लॉगिन:
- Username: `admin`
- Password: `admin123`

### विकल्प 2: GitHub Pages पर डिप्लॉय करें
1. GitHub पर नया repository बनाएँ
2. सभी फाइलें upload करें
3. Settings > Pages में जाएँ
4. Source में `main` branch select करें
5. Save करें

### विकल्प 3: Custom Domain के साथ
1. अपना domain खरीदें
2. GitHub Pages settings में custom domain add करें
3. CNAME फाइल बनाएँ

## डेटा स्टोरेज
- सभी कहानियाँ browser के localStorage में save होती हैं
- एडमिन सेटिंग्स भी localStorage में save होती हैं
- JSON फाइल से initial data load होता है

## बैकअप
1. Admin panel में settings section पर जाएँ
2. Data export का option आने वाला है (अगले update में)
3. अभी के लिए localStorage data manually backup करें

## समर्थन
समस्या होने पर:
1. Browser cache clear करें
2. LocalStorage clear करें
3. फिर से try करें

## लाइसेंस
मुफ्त उपयोग के लिए
