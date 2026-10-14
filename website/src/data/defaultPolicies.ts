export interface PolicySection {
  id: string;
  title: string;
  summary: string;
  content: string[];
  badge?: string;
  subsections?: { subtitle: string; details: string }[];
}

export interface PolicyDocument {
  title: string;
  type: "Terms & Conditions" | "Refund & Cancellation" | "Privacy Policy";
  target: "User" | "Vendor";
  effectiveDate: string;
  version: string;
  tagline: string;
  summary: string;
  sections: PolicySection[];
}

export const defaultPolicyData: Record<string, Record<"User" | "Vendor", PolicyDocument>> = {
  "Terms & Conditions": {
    User: {
      title: "Terms & Conditions for Travelers",
      type: "Terms & Conditions",
      target: "User",
      effectiveDate: "January 1, 2026",
      version: "v3.2.0 (Consumer Protection Compliant)",
      tagline: "Your comprehensive legal guide to booking, traveling, and exploring with dotravels.",
      summary:
        "These Terms & Conditions govern your access to and use of the dotravels platform, mobile services, and reservations across Kerala tour packages, luxury resorts, tourist coach rentals, flight ticketing, and pilgrim services.",
      sections: [
        {
          id: "acceptance-of-terms",
          title: "1. Acceptance of Terms & Eligibility",
          summary: "By accessing or reserving travel services on dotravels, you agree to comply with all binding terms.",
          badge: "Binding Agreement",
          content: [
            "By browsing, accessing, or transacting on the dotravels website (dotravels.com) or associated mobile web applications, you represent that you are at least 18 years of age and possess full legal capacity to enter into binding agreements.",
            "If you are booking on behalf of family members, travel groups, corporate entities, or minor companions, you warrant that you are authorized to accept these terms on their behalf and assume full financial responsibility for all reservations made under your account.",
            "dotravels operates as an authenticated travel technology marketplace connecting travelers with verified third-party partners (such as luxury hotels, accredited coach operators, licensed tour guides, and certified visa consultants)."
          ]
        },
        {
          id: "booking-and-payments",
          title: "2. Booking Verification, Pricing & Payments",
          summary: "Transparent pricing, instantaneous payment verification, and 256-bit SSL encrypted transactions.",
          badge: "PCI-DSS Secured",
          content: [
            "All pricing quotes displayed on our portal are denominated in Indian National Rupees (INR) or specified foreign currencies with mandatory applicable GST/taxes clearly itemized before final checkout.",
            "A booking is deemed confirmed only upon the successful generation of a unique Booking Reference ID (e.g., BK-XXXXXX) and receipt of payment confirmation via SMS and registered email.",
            "We accept encrypted payments via UPI (Google Pay, PhonePe, Paytm), RuPay, Visa, Mastercard, NetBanking, and international credit cards processed through bank-grade Level 1 PCI-DSS compliant gateways."
          ],
          subsections: [
            {
              subtitle: "Special Requests & Customizations",
              details: "Special dietary requirements, wheelchair assistance, or adjoining room preferences are communicated to partners immediately, but remain subject to operational feasibility at the destination."
            }
          ]
        },
        {
          id: "user-conduct-and-safety",
          title: "3. Traveler Conduct, Safety & Documentation",
          summary: "Travelers are required to carry government-approved photo identity and respect local guidelines.",
          badge: "Safety Protocol",
          content: [
            "All adult travelers must carry valid government-approved photo identification (such as Aadhaar Card, Passport, Voter ID, or Driving License) throughout the journey for hotel check-ins and interstate transport checkpoints.",
            "For international destinations, flight bookings, and holy pilgrimages (Hajj & Umrah), travelers are solely responsible for possessing a passport with at least 6 months remaining validity from the date of return and obtaining necessary travel visas.",
            "Travelers are expected to maintain courteous conduct towards drivers, tour guides, and fellow passengers. Unlawful behavior, possession of contraband, or abusive conduct may result in immediate termination of the trip without any refund."
          ]
        },
        {
          id: "luggage-and-valuables",
          title: "4. Baggage Allowance & Personal Property",
          summary: "Guidelines on permitted luggage limits and protection of personal valuables.",
          content: [
            "Standard luggage allowances for tourist bus charters and cab transfers allow up to 15 kg per passenger in designated luggage boots, plus 1 piece of personal hand luggage.",
            "Travelers are advised to safeguard precious jewelry, cameras, electronic devices, and cash. dotravels and its transport partners accept no liability for loss, theft, or accidental damage to unattended personal belongings."
          ]
        },
        {
          id: "limitation-of-liability",
          title: "5. Force Majeure & Limitation of Liability",
          summary: "Protection against unforeseen natural events, severe weather, strikes, and government road closures.",
          badge: "Legal Protection",
          content: [
            "dotravels acts in good faith to orchestrate memorable holiday experiences. However, neither dotravels nor its partners shall be held liable for delays, rerouting, or itinerary alterations caused by Acts of God (floods, landslides, severe cyclonic weather), strikes, civil commotion, or unexpected government border advisories.",
            "In unforeseen disruptions, our 24/7 Rapid Response team will endeavor to arrange equivalent alternative transport or accommodation at the earliest feasible juncture."
          ]
        },
        {
          id: "governing-law",
          title: "6. Dispute Resolution & Governing Jurisdiction",
          summary: "Disputes are handled through fair arbitration under Kerala High Court jurisdiction.",
          content: [
            "These Terms & Conditions are governed by and construed in accordance with the laws of the Republic of India.",
            "Any claims, disputes, or controversies arising out of or in connection with dotravels platform services shall be subject to the exclusive jurisdiction of the competent courts in Ernakulam / Kochi, Kerala."
          ]
        }
      ]
    },
    Vendor: {
      title: "Partner & Vendor Merchant Agreement",
      type: "Terms & Conditions",
      target: "Vendor",
      effectiveDate: "January 1, 2026",
      version: "v4.1.0 (Enterprise Partner Standard)",
      tagline: "The legal framework for verified travel agencies, fleet operators, and hoteliers on dotravels.",
      summary:
        "This Partner Agreement establishes the operational, financial, and legal terms governing vendor registration, catalog publishing, booking fulfillment, customer service standards, and weekly payout disbursements on dotravels.",
      sections: [
        {
          id: "partner-onboarding",
          title: "1. Partner Accreditation & Eligibility",
          summary: "Strict verification requirements including GSTIN, KYC, commercial vehicle permits, and trade licenses.",
          badge: "Vetting Standards",
          content: [
            "To qualify as a verified partner on dotravels, travel operators, hoteliers, and fleet managers must furnish valid Business Registration documents, PAN, GSTIN certificate, Trade License, and relevant statutory operating permits.",
            "Transport vendors must guarantee that all registered tourist buses, tempo travellers, and commercial cabs possess active all-India / state permits, comprehensive commercial insurance, fitness certificates, and speed governor calibration certificates.",
            "dotravels reserves the absolute right to audit partner credentials, conduct on-site vehicle/property inspections, or suspend partner accounts that fail our safety and hygiene protocols."
          ]
        },
        {
          id: "service-level-agreement",
          title: "2. Service Level Agreement (SLA) & Fulfillment Guarantee",
          summary: "Mandatory standards for punctuality, vehicle cleanliness, courteous drivers, and room readiness.",
          badge: "Quality SLA",
          content: [
            "Partners must confirm instant booking allocations or respond to customized itinerary inquiries within 120 minutes of receipt.",
            "For transport rentals, vehicles must arrive at the traveler's pickup point at least 15 minutes prior to scheduled departure, in spotless sanitized condition with air conditioning fully functional.",
            "Drivers assigned to customer trips must hold valid commercial driving badges, wear clean uniforms, maintain zero blood alcohol level, and behave with utmost courtesy."
          ],
          subsections: [
            {
              subtitle: "Emergency Vehicle Breakdown SLA",
              details: "In the rare event of mechanical failure during transit, the vendor must dispatch an equivalent or upgraded replacement vehicle within 90 minutes or coordinate seamless alternate transit."
            }
          ]
        },
        {
          id: "escrow-and-payouts",
          title: "3. Commission Model, Escrow & Automated Payouts",
          summary: "Transparent platform fee schedules and guaranteed scheduled bank payouts.",
          badge: "Guaranteed Payouts",
          content: [
            "Customer payments are securely held in an RBI-compliant escrow account until service fulfillment milestones are satisfied.",
            "Platform commissions range from 5% to 12% based on your active Vendor Subscription Plan (Basic, Pro, or Enterprise Elite).",
            "Net merchant payouts are automatically disbursed via NEFT/RTGS to the partner's verified bank account every Tuesday and Friday following completed trip verification."
          ]
        },
        {
          id: "customer-safety-and-complaints",
          title: "4. Traveler Care, Escalations & Dispute Protocol",
          summary: "Prompt resolution of customer feedback and adherence to consumer protection benchmarks.",
          content: [
            "Partners agree to cooperate transparently with dotravels Support Specialists to investigate traveler complaints or itinerary discrepancies.",
            "If a partner fails to provide confirmed amenities (e.g., AC malfunction, downgraded room category, unnotified route deviation), the vendor will be liable to issue appropriate compensatory credits or customer refund adjustments."
          ]
        },
        {
          id: "intellectual-property-and-data",
          title: "5. Data Confidentiality & Anti-Poaching Clause",
          summary: "Strict prohibition on unsolicited marketing and traveler data exploitation.",
          badge: "Strict Compliance",
          content: [
            "Partners receive traveler contact details solely for booking logistics and operational coordination during the active trip window.",
            "Direct soliciting, offline poaching of travelers introduced via dotravels, or misuse of customer phone numbers for spam is strictly prohibited and constitutes grounds for immediate blacklisting and forfeiture of pending wallet balance."
          ]
        },
        {
          id: "termination",
          title: "6. Account Termination & Exit Terms",
          summary: "Clear 30-day notice provisions and fulfillment of active bookings before account closure.",
          content: [
            "Either party may terminate this partnership by delivering a 30-day written notice via registered email.",
            "In the event of termination, the vendor remains legally obligated to honor and execute all pre-confirmed customer bookings in accordance with quality standards, after which final settlement of escrow balances will be released within 14 banking days."
          ]
        }
      ]
    }
  },

  "Refund & Cancellation": {
    User: {
      title: "Refund & Cancellation Policy for Travelers",
      type: "Refund & Cancellation",
      target: "User",
      effectiveDate: "January 1, 2026",
      version: "v3.0.0 (Fair Fare Protection)",
      tagline: "Transparent cancellation timelines, guaranteed refund slabs, and effortless processing.",
      summary:
        "We understand travel plans can shift. Our flexible refund guidelines ensure fair compensation, instant wallet credits, and prompt bank processing whenever you need to modify or cancel your journey.",
      sections: [
        {
          id: "cancellation-slabs",
          title: "1. Standard Holiday Packages & Hotel Cancellation Windows",
          summary: "Graduated refund slabs based on how early you notify our booking team.",
          badge: "Standard Slabs",
          content: [
            "Cancellations requested more than 15 days prior to scheduled departure receive a 90% refund of the total booking value (retaining a 10% administrative processing fee).",
            "Cancellations requested between 7 to 14 days prior to departure receive a 75% refund of total booking value.",
            "Cancellations requested between 3 to 6 days (72 to 144 hours) prior to departure receive a 50% refund.",
            "Cancellations requested within 72 hours of departure or failure to show up at pickup time ('No-Show') are non-refundable due to pre-committed partner allocations."
          ]
        },
        {
          id: "tourist-bus-and-cab-slabs",
          title: "2. Tourist Bus & Private Vehicle Rental Slabs",
          summary: "Dedicated terms for private coaches, wedding bus rentals, and airport transfers.",
          badge: "Vehicle Rentals",
          content: [
            "Bus/Cab Cancellation > 72 hours before pickup: 100% full refund minus nominal banking gateway charges.",
            "Bus/Cab Cancellation between 24 and 72 hours before pickup: 70% refund.",
            "Bus/Cab Cancellation < 24 hours before pickup: 25% refund (to offset driver diesel and vehicle block expenses)."
          ]
        },
        {
          id: "flight-and-visa-exceptions",
          title: "3. Flight Tickets, Visas & Pilgrim Package Exceptions",
          summary: "Airline fare rules and government consular fee exemptions.",
          badge: "Special Services",
          content: [
            "Commercial airline tickets are governed by respective airline fare rules and cancellation penalty structures (such as Air India Express, IndiGo, Emirates). Airline refunds are credited immediately upon airline remittance.",
            "Visa application fees, embassy stampings, and biometric appointment charges are 100% non-refundable once documentation has been submitted to consular authorities.",
            "Hajj and Umrah package cancellations are governed by Saudi Ministry of Hajj & Umrah seasonal refund mandates."
          ]
        },
        {
          id: "refund-processing-time",
          title: "4. Refund Timeline & Payout Modes",
          summary: "Fast refunds returned directly to your original payment source or instant travel wallet.",
          badge: "5-7 Days Bank Refund",
          content: [
            "Instant Travel Wallet: Choose dotravels Wallet credit for 100% instant disbursement usable on any future package or vehicle rental, with an extra 5% loyalty bonus credit.",
            "Original Payment Source: UPI, NetBanking, and Credit Card refunds are initiated within 24 hours of cancellation approval and typically reflect in your bank account within 5 to 7 business banking days depending on your bank's clearance cycle."
          ]
        },
        {
          id: "cancellation-by-dotravels",
          title: "5. Trip Cancellation Initiated by dotravels / Partners",
          summary: "100% full refund guarantee if we are ever unable to deliver your booked experience.",
          badge: "100% Money Back",
          content: [
            "If dotravels or a partner is compelled to cancel a package due to unforeseen operational hurdles, you are entitled to choose between an immediate 100% full refund or a free upgrade to an equivalent itinerary.",
            "In natural disaster or road closure situations, unutilized trip portions will be calculated transparently and refunded promptly."
          ]
        },
        {
          id: "how-to-cancel",
          title: "6. How to Submit a Cancellation Request",
          summary: "Cancel in 1-click via your Dashboard or contact our 24/7 Helpline.",
          content: [
            "Log into your account at dotravels.com, navigate to 'My Bookings', click on the active booking, and select 'Cancel Booking'.",
            "Alternatively, send a message to our 24/7 WhatsApp Helpline at +91 98951 00000 or email support@dotravels.com quoting your Booking Reference ID."
          ]
        }
      ]
    },
    Vendor: {
      title: "Partner Cancellation, No-Show & Penalty Protocol",
      type: "Refund & Cancellation",
      target: "Vendor",
      effectiveDate: "January 1, 2026",
      version: "v3.5.0 (Merchant Fairplay Standard)",
      tagline: "Operational guidelines for customer refunds, partner cancellations, and escrow adjustments.",
      summary:
        "This document details vendor responsibilities regarding booking fulfillment, penalties for partner-initiated cancellations, traveler refund chargebacks, and force majeure handling.",
      sections: [
        {
          id: "partner-cancellation-penalty",
          title: "1. Partner-Initiated Booking Cancellations",
          summary: "Strict zero-cancellation standards to safeguard traveler trust and platform integrity.",
          badge: "Strict Penalty SLA",
          content: [
            "Once a vendor accepts a customer booking, unilateral cancellation without compelling force majeure is strictly prohibited.",
            "If a partner cancels a confirmed booking within 48 hours of service commencement, a cancellation penalty of 25% of the booking value will be levied against the vendor's wallet balance to cover the cost of sourcing an emergency replacement operator.",
            "Repeated partner cancellations (more than 2 within a 90-day window) will trigger an immediate account status review and potential suspension."
          ]
        },
        {
          id: "customer-refund-deductions",
          title: "2. Processing Customer Refunds & Escrow Adjustments",
          summary: "Automatic calculation of vendor payouts in accordance with customer cancellation slabs.",
          content: [
            "When a traveler cancels within the permissible refund window, dotravels system automatically adjusts escrow balances. The non-refundable portion (as per traveler slab) is disbursed to the partner during the next scheduled payout cycle.",
            "Partners will not receive payouts for bookings where service was not rendered due to vendor default."
          ]
        },
        {
          id: "no-show-protocol",
          title: "3. Traveler No-Show Verification Protocol",
          summary: "Proof requirements before marking a customer as a No-Show.",
          badge: "Verification Required",
          content: [
            "If a traveler does not appear at the scheduled pickup point or hotel lobby, the partner driver/representative must attempt phone contact at least 3 times and wait a minimum of 45 minutes beyond the scheduled time.",
            "Partners must log the no-show via the Vendor Dashboard with GPS timestamp and call log proof. Upon verification, 100% of the vendor's entitled net payout will be released."
          ]
        },
        {
          id: "force-majeure-for-vendors",
          title: "4. Acts of God, Landslides & Extreme Weather",
          summary: "Waiver of penalties during declared natural emergencies and road blockades.",
          content: [
            "In cases of verified natural disasters (e.g., Munnar gap road landslides, Wayanad flash floods, national strikes), partner cancellation penalties are fully waived.",
            "Partners must notify dotravels Operations Desk immediately so alternate travel routes or customer credits can be coordinated."
          ]
        }
      ]
    }
  },

  "Privacy Policy": {
    User: {
      title: "Privacy Policy for Travelers",
      type: "Privacy Policy",
      target: "User",
      effectiveDate: "January 1, 2026",
      version: "v4.0.0 (DPDP Act & GDPR Compliant)",
      tagline: "How we collect, protect, encrypt, and manage your personal data across all dotravels platforms.",
      summary:
        "dotravels is deeply committed to safeguarding your personal data and upholding your digital privacy. This policy explains what information we collect, how it empowers seamless travel bookings, and how you maintain full control over your profile.",
      sections: [
        {
          id: "data-collection",
          title: "1. Information We Collect",
          summary: "Personal details required to book hotels, issue tickets, and customize holiday itineraries.",
          badge: "Transparency",
          content: [
            "Account & Profile Info: Name, email address, mobile phone number, date of birth, and home city.",
            "Booking & Travel Details: Pickup/drop coordinates, passenger names, age brackets, special dietary or medical preferences, and flight itinerary numbers.",
            "Payment & Financial Data: Encrypted tokenized transaction identifiers. We DO NOT store full credit/debit card numbers or CVV codes on our servers.",
            "Technical & Device Telemetry: IP address, device model, operating system, browser type, and geolocation data (only with your explicit device permission) for locating nearest tourist attractions."
          ]
        },
        {
          id: "data-usage",
          title: "2. How We Utilize Your Information",
          summary: "Fulfilling bookings, sending real-time trip alerts, and providing AI-powered recommendations.",
          content: [
            "To confirm reservations, generate digital boarding vouchers, and facilitate check-in at partner hotels.",
            "To transmit live SMS/WhatsApp updates regarding driver contact details, vehicle tracking, and flight status changes.",
            "To power the dotravels AI Trip Planner with customized destination itineraries suited to your budget and travel pace.",
            "To detect and prevent fraudulent transactions, identity theft, or platform abuse."
          ]
        },
        {
          id: "data-sharing",
          title: "3. Third-Party Sharing & Partner Disclosure",
          summary: "We never sell your data. We share only what is required to execute your booked trip.",
          badge: "Zero Data Selling",
          content: [
            "Fulfillment Partners: We securely share necessary passenger details (e.g., passenger names, contact number, pickup location) with the specific hotel, coach operator, or guide assigned to your trip.",
            "Regulatory & Legal Authorities: We may disclose data if required by Indian law enforcement, aviation security agencies, or court orders.",
            "Zero Third-Party Advertising: We NEVER sell, rent, or lease your personal contact information to third-party telemarketers or external ad networks."
          ]
        },
        {
          id: "security-encryption",
          title: "4. Data Security, 256-Bit SSL & Cloud Infrastructure",
          summary: "Enterprise-grade encryption and ISO-compliant cloud security protocols.",
          badge: "ISO 27001 Certified",
          content: [
            "All network traffic between your device and our servers is secured using TLS 1.3 encryption with 256-bit cryptographic keys.",
            "Our databases are hosted in SOC 2 Type II certified cloud data centers with continuous automated penetration testing, strict firewalling, and daily offsite backups."
          ]
        },
        {
          id: "user-rights",
          title: "5. Your Privacy Rights (Access, Rectification & Erasure)",
          summary: "You hold the right to access, edit, download, or completely erase your account data.",
          badge: "Full Control",
          content: [
            "Right to Access: You can request a digital copy of all personal records associated with your profile at any time.",
            "Right to Correction: Easily update your name, email, or telephone in your Dashboard Settings.",
            "Right to Forgotten / Account Erasure: You may request complete deletion of your account and personal history by emailing privacy@dotravels.com. Data will be purged within 30 days unless required by tax/statutory regulations."
          ]
        },
        {
          id: "cookies-and-dpo",
          title: "6. Cookies & Contact Our Data Protection Officer",
          summary: "Reach out directly to our designated Data Protection Officer.",
          content: [
            "We use essential session cookies to remember your login state, wishlist items, and search filters. You can disable non-essential analytics cookies in your browser settings.",
            "If you have questions or concerns regarding privacy, contact: Data Protection Officer (DPO), dotravels Headquarters, MG Road, Kochi, Kerala 682016, India. Email: dpo@dotravels.com | Phone: +91 471 123 4567."
          ]
        }
      ]
    },
    Vendor: {
      title: "Partner Data Privacy & Security Governance",
      type: "Privacy Policy",
      target: "Vendor",
      effectiveDate: "January 1, 2026",
      version: "v3.2.0 (B2B Compliance)",
      tagline: "Protocols governing vendor business records, traveler data privacy, and KYC protection.",
      summary:
        "This policy outlines how dotravels processes partner business credentials, bank accounts, vehicle registries, and establishes strict confidentiality obligations regarding traveler information handled by vendors.",
      sections: [
        {
          id: "partner-data-collection",
          title: "1. Business Information & KYC Records",
          summary: "Collection and verification of business entities, PAN, GSTIN, and banking channels.",
          badge: "KYC Compliance",
          content: [
            "We collect business registration certificates, trade licenses, GSTIN, company PAN, and bank account beneficiary records for identity verification and direct escrow disbursements.",
            "Transport operators submit driver licenses, vehicle registration certificates (RC books), insurance certificates, and fitness fitness records to guarantee platform compliance."
          ]
        },
        {
          id: "traveler-data-handling",
          title: "2. Partner Duty of Confidentiality Regarding Travelers",
          summary: "Strict prohibition on storing or misusing customer personal data.",
          badge: "Strict Confidentiality",
          content: [
            "Vendors and their drivers/staff are granted access to traveler names, pickup points, and phone numbers strictly for operational fulfillment during the active service window.",
            "Partners are strictly prohibited from copying, retaining, or using traveler contact details for personal marketing, unsolicited WhatsApp broadcasts, or sharing with external entities.",
            "Breach of traveler privacy by a vendor will result in immediate termination of the partner contract and potential civil/statutory liability."
          ]
        },
        {
          id: "api-and-dashboard-security",
          title: "3. API Key & Dashboard Credential Security",
          summary: "Best practices for securing vendor dashboard access and passkeys.",
          badge: "Security Standard",
          content: [
            "Partners are responsible for maintaining the confidentiality of their login credentials, passkeys, and external API secret keys.",
            "We strongly recommend enabling two-factor authentication (2FA) for all administrative and staff dashboard logins."
          ]
        }
      ]
    }
  }
};
