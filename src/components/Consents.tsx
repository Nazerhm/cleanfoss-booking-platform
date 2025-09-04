// Consents and checkboxes component

import React from 'react';
import { Consents, FormErrors } from '../lib/types';

interface ConsentsProps {
  consents: Consents;
  onChange: (consents: Consents) => void;
  errors: FormErrors;
  className?: string;
}

export default function ConsentsComponent({
  consents,
  onChange,
  errors,
  className = ''
}: ConsentsProps) {
  const handleChange = (field: keyof Consents, value: boolean) => {
    onChange({
      ...consents,
      [field]: value
    });
  };

  return (
    <fieldset className={className}>
      <legend className="text-lg font-semibold text-gray-900 mb-4">
        Samtykker
      </legend>
      
      <div className="space-y-4">
        {/* Create account */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="consent-create-account"
            checked={consents.createAccount}
            onChange={(e) => handleChange('createAccount', e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="consent-create-account" className="text-sm text-gray-700 leading-5">
            Opret konto, så du kan se og rette din bestilling
          </label>
        </div>

        {/* Marketing */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="consent-marketing"
            checked={consents.marketing}
            onChange={(e) => handleChange('marketing', e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="consent-marketing" className="text-sm text-gray-700 leading-5">
            Jeg vil gerne modtage tips og tricks til pleje af min bil, tilbud og have mulighed for at vinde præmier via e-mail/sms.
          </label>
        </div>

        {/* Terms (required) */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="consent-terms"
            checked={consents.terms}
            onChange={(e) => handleChange('terms', e.target.checked)}
            className={`
              mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2
              ${errors.terms ? 'border-red-300' : ''}
            `}
            aria-describedby={errors.terms ? 'consent-terms-error' : undefined}
            required
          />
          <div>
            <label htmlFor="consent-terms" className="text-sm text-gray-700 leading-5">
              Jeg accepterer{' '}
              <a 
                href="#" 
                className="text-blue-600 hover:text-blue-800 underline"
                onClick={(e) => {
                  e.preventDefault();
                  // Open terms modal or navigate to terms page
                  console.log('Open terms and conditions');
                }}
              >
                SteamFoss Handelsbetingelser
              </a>{' '}
              *
            </label>
            {errors.terms && (
              <p id="consent-terms-error" className="mt-1 text-sm text-red-600">
                {errors.terms}
              </p>
            )}
          </div>
        </div>
      </div>
    </fieldset>
  );
}
