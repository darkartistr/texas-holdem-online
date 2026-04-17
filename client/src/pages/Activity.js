import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import Container from '../components/layout/Container';
import HeadingWithLogo from '../components/typography/HeadingWithLogo';
import Button from '../components/buttons/Button';
import RelativeWrapper from '../components/layout/RelativeWrapper';
import config from '../clientConfig';

const Card = styled.div`
  width: 100%;
  max-width: 980px;
  background: ${(props) => props.theme.colors.playingCardBg};
  border-radius: ${(props) => props.theme.other.stdBorderRadius};
  box-shadow: ${(props) => props.theme.other.cardDropShadow};
  padding: 1rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media screen and (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }
`;

const FilterField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.95rem;
`;

const FilterInput = styled.input`
  border: 1px solid ${(props) => props.theme.colors.lightestBg};
  border-radius: 6px;
  padding: 0.5rem 0.6rem;
`;

const FilterSelect = styled.select`
  border: 1px solid ${(props) => props.theme.colors.lightestBg};
  border-radius: 6px;
  padding: 0.5rem 0.6rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  border-bottom: 1px solid ${(props) => props.theme.colors.lightestBg};
  padding: 0.75rem 0;
`;

const apiBaseUrl = config.apiBaseUrl || '';
const ledgerTypes = ['', 'deposit', 'withdrawal', 'bet', 'win', 'refund', 'bonus'];
const defaultLimit = '10';

const readParam = (searchParams, key, fallback = '') => searchParams.get(key) || fallback;

const Activity = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = localStorage.getItem('token');

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ hasMore: false, nextCursor: null, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState(readParam(searchParams, 'search'));
  const debouncedSearch = useMemo(() => searchInput.trim(), [searchInput]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    setSearchInput(readParam(searchParams, 'search'));
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      const current = readParam(searchParams, 'search');
      if (debouncedSearch === current) return;

      if (debouncedSearch) {
        next.set('search', debouncedSearch);
      } else {
        next.delete('search');
      }
      next.delete('cursor');
      setSearchParams(next);
    }, 350);

    return () => clearTimeout(timer);
  }, [debouncedSearch, searchParams, setSearchParams]);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    const fetchLedger = async () => {
      setIsLoading(true);
      setError('');
      try {
        const query = searchParams.toString();
        const endpoint = `${apiBaseUrl}/api/v1/ledger${query ? `?${query}` : ''}`;
        const { data } = await axios.get(endpoint, {
          headers: {
            'x-auth-token': token,
          },
        });

        if (!isMounted) return;
        setItems(data?.data?.items || []);
        setPagination(data?.data?.pagination || { hasMore: false, nextCursor: null, total: 0 });
      } catch (err) {
        if (!isMounted) return;
        const message =
          err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.message ||
          err.message ||
          'Failed to load activity.';
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLedger();
    return () => {
      isMounted = false;
    };
  }, [token, searchParams]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete('cursor');
    setSearchParams(next);
  };

  const currentLimit = readParam(searchParams, 'limit', defaultLimit);

  return (
    <RelativeWrapper>
      <Container
        fullHeight
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
        padding="6rem 1rem 2rem 1rem"
      >
        <Card>
          <HeadingWithLogo textCentered hideIconOnMobile={false}>
            Activity
          </HeadingWithLogo>

          <FiltersGrid>
            <FilterField>
              Type
              <FilterSelect
                value={readParam(searchParams, 'type')}
                onChange={(event) => setParam('type', event.target.value)}
              >
                {ledgerTypes.map((type) => (
                  <option key={type || 'all'} value={type}>
                    {type || 'all'}
                  </option>
                ))}
              </FilterSelect>
            </FilterField>

            <FilterField>
              Min amount
              <FilterInput
                type="number"
                min="0"
                value={readParam(searchParams, 'minAmount')}
                onChange={(event) => setParam('minAmount', event.target.value)}
              />
            </FilterField>

            <FilterField>
              Max amount
              <FilterInput
                type="number"
                min="0"
                value={readParam(searchParams, 'maxAmount')}
                onChange={(event) => setParam('maxAmount', event.target.value)}
              />
            </FilterField>

            <FilterField>
              Search
              <FilterInput
                type="text"
                placeholder="description or reference"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </FilterField>

            <FilterField>
              Page size
              <FilterSelect
                value={currentLimit}
                onChange={(event) => setParam('limit', event.target.value)}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </FilterSelect>
            </FilterField>
          </FiltersGrid>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'center' }}>
            <Button
              small
              secondary
              onClick={() => {
                setSearchInput('');
                setSearchParams(new URLSearchParams({ limit: defaultLimit }));
              }}
            >
              Reset Filters
            </Button>
            <Button as={Link} to="/play" small secondary>
              Back to Play
            </Button>
          </div>

          {isLoading && <p>Loading activity...</p>}
          {!isLoading && error && <p style={{ color: '#b00020' }}>Error: {error}</p>}
          {!isLoading && !error && items.length === 0 && <p>No activity found for selected filters.</p>}

          {!isLoading && !error && items.length > 0 && (
            <>
              <p style={{ marginBottom: '0.5rem' }}>Total (filtered): {pagination.total}</p>
              <List>
                {items.map((item) => (
                  <ListItem key={item.id}>
                    <strong>{item.type}</strong> | Amount: {item.amount} | Balance: {item.balanceAfter}
                    <br />
                    {item.description} ({item.reference || 'n/a'})
                    <br />
                    <small>{new Date(item.created).toLocaleString()}</small>
                  </ListItem>
                ))}
              </List>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                <Button
                  small
                  primary
                  disabled={!pagination.hasMore || !pagination.nextCursor}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('cursor', pagination.nextCursor);
                    setSearchParams(next);
                  }}
                >
                  Next Page
                </Button>
              </div>
            </>
          )}
        </Card>
      </Container>
    </RelativeWrapper>
  );
};

export default Activity;
