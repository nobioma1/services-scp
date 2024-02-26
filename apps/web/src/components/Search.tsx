import { useEffect, useState } from 'react';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { IoSearchOutline } from 'react-icons/io5';

import { useDebounce } from '../hooks/use-debounce';

interface SearchProps {
  handleChange(value: string): void;
}

const Search = ({ handleChange }: SearchProps) => {
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 500);

  useEffect(() => {
    handleChange(debouncedSearchText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchText]);

  return (
    <InputGroup height="100%">
      <InputLeftElement height="100%" pointerEvents="none">
        <IoSearchOutline size={25} color="lightgray" />
      </InputLeftElement>
      <Input
        bg="white"
        type="text"
        height="100%"
        placeholder="Search public events"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
    </InputGroup>
  );
};

export default Search;
