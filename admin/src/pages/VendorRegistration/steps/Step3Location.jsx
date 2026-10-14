import React from 'react';
import { MapPin, Globe } from 'lucide-react';
import { getInputFieldStyle, getFieldError } from '../components/SharedUI';
import MapPicker from '../components/MapPicker';
import CustomSearchableSelect from '../components/CustomSearchableSelect';

const Step3Location = ({ 
  formik, isViewMode, countries = [], states = [], 
  citySuggestions, isSearchingCity, setCitySuggestions, setIsSearchingCity 
}) => {
  const handleCitySearch = async (query) => {
    if (!query || query.length < 3) {
      setCitySuggestions([]);
      return;
    }
    setIsSearchingCity(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setCitySuggestions(data || []);
    } catch (error) {
      console.error('City search failed', error);
      setCitySuggestions([]);
    } finally {
      setIsSearchingCity(false);
    }
  };

  const selectCitySuggestion = (suggestion) => {
    const addr = suggestion.address || {};
    const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.county || suggestion.display_name?.split(',')[0]?.trim() || '';
    
    formik.setFieldValue('address.city', cityName);

    if (!formik.values.address.fullAddress) {
      formik.setFieldValue('address.fullAddress', suggestion.display_name);
    }
    if (addr.postcode && !formik.values.address.zipCode) {
      formik.setFieldValue('address.zipCode', addr.postcode);
    }

    formik.setFieldValue('address.latitude', parseFloat(suggestion.lat));
    formik.setFieldValue('address.longitude', parseFloat(suggestion.lon));

    // 1. Automatic Country Selection
    const countryName = (addr.country || '').trim().toLowerCase();
    const countryCode = (addr.country_code || '').trim().toUpperCase();

    const matchedCountry = displayCountries.find(c => 
      (c.code && c.code.toUpperCase() === countryCode) ||
      (c.name && c.name.toLowerCase() === countryName) ||
      (typeof c._id === 'string' && (c._id.toLowerCase() === countryName || c._id.toUpperCase() === countryCode))
    );

    let resolvedCountryId = '';
    if (matchedCountry) {
      resolvedCountryId = matchedCountry._id;
      formik.setFieldValue('address.country', matchedCountry._id);
    } else if (addr.country) {
      resolvedCountryId = addr.country;
      formik.setFieldValue('address.country', addr.country);
    }

    // 2. Automatic State / Region Selection
    const rawStateName = (addr.state || addr.region || addr.state_district || '').trim().toLowerCase();
    if (rawStateName) {
      // Find candidate states
      const candidateStates = states && states.length > 0 ? states : displayStates;
      const matchedState = candidateStates.find(s => {
        const sName = (s.name || '').trim().toLowerCase();
        const sId = (typeof s._id === 'string' ? s._id : '').trim().toLowerCase();
        return sName === rawStateName || sId === rawStateName || rawStateName.includes(sName) || (sName.length > 3 && sName.includes(rawStateName));
      });

      if (matchedState) {
        formik.setFieldValue('address.state', matchedState._id);
      } else if (addr.state || addr.region) {
        formik.setFieldValue('address.state', addr.state || addr.region);
      }
    }

    setCitySuggestions([]);
  };

  const selectedCountryId = formik.values.address.country;

  const displayCountries = (countries && Array.isArray(countries)) ? countries : [];

  // Filter states by selected country
  const filteredStates = (states && Array.isArray(states))
    ? states.filter(s => {
        if (!selectedCountryId) return true;
        const countryId = typeof s.country === 'object' ? s.country?._id : s.country;
        return String(countryId) === String(selectedCountryId);
      })
    : [];

  const displayStates = (filteredStates && filteredStates.length > 0)
    ? filteredStates
    : ((states && Array.isArray(states)) ? states : []);

  const countryOptions = displayCountries.map(c => ({
    value: c._id,
    label: `${c.name} ${c.code ? `(${c.code})` : ''}`
  }));

  const stateOptions = displayStates.map(s => ({
    value: s._id,
    label: s.name
  }));

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MapPin color="var(--primary)" /> Geospatial & Headquarters Mapping
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ADDRESS TEXTAREA */}
          <div className="form-group">
            <label>Full Headquarters Address *</label>
            <textarea
              className="form-control"
              rows="3"
              disabled={isViewMode}
              {...formik.getFieldProps('address.fullAddress')}
              style={{ ...getInputFieldStyle(formik, 'address.fullAddress'), resize: 'none' }}
              placeholder="Door / Suite No, Street Name, Landmark..."
            />
            {getFieldError(formik, 'address.fullAddress')}
          </div>

          {/* CITY & ZIP CODE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ position: 'relative' }}>
              <label>City / Hub *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  disabled={isViewMode}
                  placeholder="e.g. Mumbai, New Delhi"
                  {...formik.getFieldProps('address.city')}
                  onChange={(e) => {
                    formik.handleChange(e);
                    handleCitySearch(e.target.value);
                  }}
                  style={getInputFieldStyle(formik, 'address.city')}
                />
                {isSearchingCity && (
                  <div
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    className="spinner-border spinner-border-sm text-primary"
                  />
                )}
              </div>

              {/* CITY AUTOCOMPLETE SUGGESTIONS LIST */}
              {citySuggestions.length > 0 && (
                <ul
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 999,
                    background: 'var(--bg-card, #ffffff)',
                    border: '1px solid var(--border, #e2e8f0)',
                    borderRadius: '12px',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)',
                    padding: '6px 0',
                    margin: '6px 0',
                    listStyle: 'none',
                    maxHeight: '220px',
                    overflowY: 'auto'
                  }}
                >
                  {citySuggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => selectCitySuggestion(s)}
                      style={{
                        padding: '10px 16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'var(--text-main, #0f172a)',
                        cursor: 'pointer',
                        borderBottom: i === citySuggestions.length - 1 ? 'none' : '1px solid var(--border, #f1f5f9)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.1)';
                        e.currentTarget.style.color = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-main, #0f172a)';
                      }}
                    >
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
              {getFieldError(formik, 'address.city')}
            </div>

            <div className="form-group">
              <label>Postal / Zip Code</label>
              <input
                type="text"
                className="form-control"
                disabled={isViewMode}
                placeholder="400001"
                {...formik.getFieldProps('address.zipCode')}
              />
            </div>
          </div>

          {/* CUSTOM DESIGNED SEARCHABLE COUNTRY & STATE DROPDOWNS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* COUNTRY CUSTOM DROPDOWN */}
            <div className="form-group">
              <label>Country *</label>
              <CustomSearchableSelect
                options={countryOptions}
                value={formik.values.address.country}
                onChange={(selectedVal) => {
                  formik.setFieldValue('address.country', selectedVal);
                  formik.setFieldValue('address.state', ''); // Reset state when country changes
                }}
                placeholder="Select Country"
                searchPlaceholder="Search Country..."
                disabled={isViewMode}
                hasError={Boolean(formik.touched.address?.country && formik.errors.address?.country)}
                icon={Globe}
              />
              {getFieldError(formik, 'address.country')}
            </div>

            {/* STATE CUSTOM DROPDOWN */}
            <div className="form-group">
              <label>State / Region *</label>
              <CustomSearchableSelect
                options={stateOptions}
                value={formik.values.address.state}
                onChange={(selectedVal) => {
                  formik.setFieldValue('address.state', selectedVal);
                }}
                placeholder="Select State / Region"
                searchPlaceholder="Search State..."
                disabled={isViewMode}
                hasError={Boolean(formik.touched.address?.state && formik.errors.address?.state)}
                icon={MapPin}
              />
              {getFieldError(formik, 'address.state')}
            </div>
          </div>
        </div>

        {/* MAP PICKER COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ margin: 0, fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Precision Location Pinning
            </label>
            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary)' }}>
              {formik.values.address.latitude
                ? `${formik.values.address.latitude.toFixed(4)}, ${formik.values.address.longitude.toFixed(4)}`
                : 'Click map to set pin'}
            </span>
          </div>
          <MapPicker
            latitude={formik.values.address.latitude}
            longitude={formik.values.address.longitude}
            onLocationSelect={(lat, lng) => {
              formik.setFieldValue('address.latitude', lat);
              formik.setFieldValue('address.longitude', lng);
            }}
            isViewMode={isViewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Step3Location;
