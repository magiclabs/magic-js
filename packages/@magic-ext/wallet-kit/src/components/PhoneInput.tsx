import { Button, IcoArrowRight, IcoCaretDown, IcoCheckmarkCircleFill, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Flex, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mergeProps, useButton, useFocusRing, useKeyboard } from 'react-aria';
import { FlagImage, defaultCountries, usePhoneInput, type CountryIso2 } from 'react-international-phone';
import { isValidPhoneNumber } from 'libphonenumber-js';

export interface PhoneInputProps {
  onChange: (phone: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  errorMessage?: string;
  containerStyles?: React.CSSProperties;
}

const FlagContainer = ({ iso2 }: { iso2: CountryIso2 }) => {
  return (
    <Flex
      width="1.125rem"
      height="1.125rem"
      borderRadius="full"
      borderWidth="thin"
      borderColor="neutral.primary"
      overflow="hidden"
      align="center"
    >
      <FlagImage
        src={`https://flagcdn.com/${iso2}.svg`}
        iso2={iso2}
        size={16}
        className={css({ objectFit: 'cover' })}
      />
    </Flex>
  );
};

const PhoneInput = (props: PhoneInputProps) => {
  const { onChange, onSubmit, autoFocus = true, errorMessage } = props;
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [searchString, setSearchString] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const typeAheadTimeout = useRef<number | undefined>(undefined);

  const { country, setCountry, inputRef, handlePhoneValueChange, inputValue } = usePhoneInput({
    defaultCountry: 'us',
    value,
    onChange: data => {
      setValue(data.phone);
      onChange(data.phone);
    },
    disableDialCodeAndPrefix: true,
  });

  const isPhoneValid = value.length > 0 && isValidPhoneNumber(value, country.iso2 as any);

  const currentCountryCode = useMemo(() => {
    const found = defaultCountries.find(([, iso2]) => iso2 === country.iso2);
    return found ? found[2] : '1';
  }, [country.iso2]);

  const placeholder = useMemo(() => {
    const found = defaultCountries.find(([, iso2]) => iso2 === country.iso2);
    // Format can be a string like "(..) ....-...." or a function - replace dots with digits
    const format = found && typeof found[3] === 'string' ? found[3] : null;
    return format ? format.replace(/\./g, '5') : '(555) 555-5555';
  }, [country.iso2]);

  const sortedCountries = useMemo(() => {
    const otherCountries = defaultCountries.filter(([, iso2]) => iso2 !== country.iso2);
    const selectedCountry = defaultCountries.find(([, iso2]) => iso2 === country.iso2);
    return selectedCountry ? [selectedCountry, ...otherCountries] : [...defaultCountries];
  }, [country.iso2]);

  const filteredCountries = useMemo(() => {
    return sortedCountries.filter(([, iso2]) => iso2 !== country.iso2);
  }, [country.iso2]);

  const handleSelect = useCallback(
    (iso2: CountryIso2) => {
      setCountry(iso2);
      setShowDropdown(false);
      inputRef.current?.focus();
    },
    [setCountry],
  );

  const toggleDropdown = useCallback(() => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setFocusedIndex(0);
      setTimeout(() => dropdownRef.current?.focus());
    }
  }, [showDropdown]);

  const { buttonProps } = useButton(
    {
      onPress: toggleDropdown,
    },
    buttonRef,
  );

  const { focusProps, isFocusVisible: isButtonFocused } = useFocusRing();

  const { keyboardProps } = useKeyboard({
    onKeyDown: e => {
      if (!showDropdown) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % sortedCountries.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev - 1 + sortedCountries.length) % sortedCountries.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0) {
            const [, iso2] = sortedCountries[focusedIndex];
            handleSelect(iso2);
          }
          break;
        case 'Escape':
          setShowDropdown(false);
          inputRef.current?.focus();
          break;
        default:
          if (e.key === ' ' || e.key.match(/[\w]/i)) {
            e.preventDefault();
            clearTimeout(typeAheadTimeout.current);
            setSearchString(s => s + e.key);
            typeAheadTimeout.current = window.setTimeout(() => {
              setSearchString('');
            }, 1000);
          }
          break;
      }
    },
  });

  useEffect(() => {
    // Focus the input when the component mounts if autoFocus is true
    if (autoFocus) {
      inputRef.current?.focus();
    }

    // Closes the dropdown when clicking outside of it
    const handleClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  useEffect(() => {
    // Implements type-ahead search functionality
    if (searchString !== '') {
      const matchIndex = filteredCountries.findIndex(([name]) =>
        name.toLowerCase().startsWith(searchString.toLowerCase()),
      );
      if (matchIndex !== -1) {
        const actualIndex = sortedCountries.findIndex(([name]) => name === filteredCountries[matchIndex][0]);
        setFocusedIndex(actualIndex);
        itemRefs.current[actualIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [searchString, sortedCountries, country.iso2]);

  useEffect(() => {
    // Scrolls the focused item into view
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [focusedIndex]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <VStack gap={2} style={props.containerStyles}>
      <Flex
        {...mergeProps(keyboardProps, focusProps)}
        ref={containerRef}
        height="fit-content"
        width="full"
        alignItems="center"
        justify="center"
        borderWidth="thin"
        borderColor="neutral.secondary"
        borderRadius="input"
        transition="all linear 120ms"
        outlineColor="brand.base"
        outlineStyle={isFocused && !isButtonFocused ? 'solid' : 'none'}
        outlineWidth="thick"
        outlineOffset={0.5}
        onFocus={handleFocus}
        onBlur={handleBlur}
        position="relative"
        _hover={{ borderColor: 'neutral.primary' }}
      >
        <button
          {...mergeProps(buttonProps, focusProps)}
          className={css({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderStartRadius: 'input',
            h: 12,
            w: 20,
            px: 3,
            outlineColor: 'brand.base',
            outlineStyle: isButtonFocused ? 'solid' : 'none',
            outlineWidth: 'thick',
            outlineOffset: 0.5,
            cursor: 'pointer',
            transition: 'all linear 120ms',
            _hover: {
              bg: 'surface.tertiary',
            },
          })}
        >
          <HStack gap={2}>
            <FlagContainer iso2={country.iso2} />
            <IcoCaretDown width={14} height={14} transform={showDropdown ? 'rotate(180)' : ''} />
          </HStack>
        </button>

        {showDropdown && (
          <Box
            ref={dropdownRef}
            tabIndex={-1}
            bg="surface.primary"
            position="absolute"
            w="full"
            rounded="input"
            top={55}
            boxShadow="4px 8px 20px 0px rgba(0, 0, 0, 0.15)"
            maxHeight="17.5rem"
            overflowY="auto"
            outline="none"
          >
            {sortedCountries.map(([name, iso2, countryCode], index) => {
              const isSelectedCountry = country.iso2 === iso2;
              const isFocusedCountry = focusedIndex === index;

              return (
                <HStack
                  cursor="pointer"
                  bg={isSelectedCountry ? 'brand.base' : isFocusedCountry ? 'brand.lightest' : ''}
                  _hover={!isSelectedCountry ? { bg: 'brand.lightest' } : {}}
                  key={iso2}
                  ref={el => (itemRefs.current[index] = el)}
                  gap={2}
                  p={4}
                  onClick={() => handleSelect(iso2)}
                  justify="space-between"
                >
                  <HStack gap={4}>
                    {isSelectedCountry ? (
                      <IcoCheckmarkCircleFill width={18} height={18} color={token('colors.surface.primary')} />
                    ) : (
                      <FlagContainer iso2={iso2} />
                    )}
                    <Text fontColor={isSelectedCountry ? 'text.quaternary' : 'text.primary'}>{name}</Text>
                  </HStack>
                  <Text fontColor={isSelectedCountry ? 'text.quaternary' : 'text.tertiary'}>+{countryCode}</Text>
                </HStack>
              );
            })}
          </Box>
        )}
        <HStack
          gap={0}
          alignItems="center"
          flex={1}
          style={{ borderLeftWidth: 'thin', borderColor: token('colors.neutral.secondary') }}
        >
          <span
            className={css({
              color: 'text.primary',
              fontWeight: 'medium',
              fontSize: 'md',
              paddingLeft: 4,
              paddingRight: 2,
              userSelect: 'none',
            })}
          >
            +{currentCountryCode}
          </span>
          <input
            type="tel"
            inputMode="tel"
            onChange={handlePhoneValueChange}
            value={inputValue}
            ref={inputRef}
            placeholder={placeholder}
            className={css({
              transition: 'all linear 120ms',
              width: 'full',
              boxSizing: 'border-box',
              rounded: 0,
              margin: 0,
              minWidth: 10,
              fontWeight: 'medium',
              backgroundColor: 'transparent',
              color: 'text.primary',
              height: 12,
              fontSize: 'md',
              py: 3,
              paddingRight: 4,
              paddingLeft: 0,
              textAlign: 'left',
              outline: 'none',
              _placeholder: {
                color: 'text.tertiary',
              },
            })}
          />
        </HStack>
        {onSubmit && (
          <Box style={{ paddingRight: '16px' }}>
            <Button
              aria-label="submit-phone"
              variant="text"
              textStyle="neutral"
              onClick={onSubmit}
              disabled={!isPhoneValid}
            >
              <Button.LeadingIcon color={token('colors.text.tertiary')}>
                <IcoArrowRight />
              </Button.LeadingIcon>
            </Button>
          </Box>
        )}
      </Flex>
      {errorMessage && (
        <Text variant="error" size="sm" fontWeight="normal">
          {errorMessage}
        </Text>
      )}
    </VStack>
  );
};

PhoneInput.displayName = 'PhoneInput';
export default PhoneInput;
