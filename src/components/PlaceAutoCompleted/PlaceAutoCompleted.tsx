import { useMemo, useRef, useState } from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { GooglePlacesAutocompleteHandle } from 'react-google-places-autocomplete/build/types';

type PlaceAutoCompletedProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export function PlaceAutoCompleted({
  value,
  onChange,
}: PlaceAutoCompletedProps) {
  const ref = useRef<GooglePlacesAutocompleteHandle>(null);

  const [place, setPlace] = useState<any>();

  const location = useMemo(() => {
    try {
      return (value && JSON.parse(value)) ?? place;
    } catch (error) {
      return undefined;
    }
  }, [place, value]);

  return (
    <GooglePlacesAutocomplete
      ref={ref}
      // apiKey="AIzaSyCA0WrEq6hrP4JrxkWX-TYKrUtu2D7yIJo"
      apiKey="AIzaSyCyUP64GfbARI8WHlEl2zIHybPnM1A0MaA"
      // minLengthAutocomplete={4}
      selectProps={{
        value: location,
        onChange: async (value) => {
          setPlace(value);

          onChange?.(JSON.stringify(value));
        },
      }}
      apiOptions={{
        language: 'vi',
        region: 'VN',
      }}
    />
  );
}

// AIzaSyCA0WrEq6hrP4JrxkWX-TYKrUtu2D7yIJo
