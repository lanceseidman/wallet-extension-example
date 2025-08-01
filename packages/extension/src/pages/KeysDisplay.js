import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import {
  Text,
  Box,
  VStack,
  HStack,
  Button,
  useClipboard,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Code,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { accountManager } from "../lib/AccountManager";
import { keyVault } from "../lib/keyVault";
import EVMAccount from "../lib/evmAccount";
import Title from "../components/Title";
import Layout from "../components/Layout";
import * as styles from "../styles";

const KeysDisplay = ({ location }) => {
  const [account, setAccount] = useState(null);
  const [evmAccount, setEvmAccount] = useState(null);
  const [keys, setKeys] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const history = useHistory();
  const toast = useToast();

  const { hasCopied: hasCopiedPrivate, onCopy: onCopyPrivate } = useClipboard(
    keys?.privateKey || ""
  );
  const { hasCopied: hasCopiedPublic, onCopy: onCopyPublic } = useClipboard(
    keys?.publicKey || ""
  );
  const { hasCopied: hasCopiedEvm, onCopy: onCopyEvm } = useClipboard(
    evmAccount?.address || ""
  );

  useEffect(() => {
    async function loadAccountKeys() {
      try {
        if (!keyVault.unlocked) {
          toast({
            title: "Wallet Locked",
            description: "Please unlock your wallet first",
            status: "error",
            duration: styles.toastDuration,
            isClosable: true,
          });
          history.push("/LogIn");
          return;
        }

        // Get current Flow account
        const currentAccount = await accountManager.getFavoriteAccount();
        if (!currentAccount) {
          toast({
            title: "No Account",
            description: "No account found",
            status: "error",
            duration: styles.toastDuration,
            isClosable: true,
          });
          return;
        }

        setAccount(currentAccount);

        // Get the first key from the account
        const keysList = currentAccount.listKeys();
        if (keysList.length === 0) {
          toast({
            title: "No Keys",
            description: "No keys found for this account",
            status: "error",
            duration: styles.toastDuration,
            isClosable: true,
          });
          return;
        }

        const firstKey = keysList[0];
        const privateKey = keyVault.getKey(firstKey.publicKey);

        // Create EVM account from the private key
        const evmAccount = new EVMAccount({ privKey: privateKey });
        setEvmAccount(evmAccount);

        setKeys({
          publicKey: firstKey.publicKey,
          privateKey: privateKey,
          keyId: firstKey.id,
          sigAlg: firstKey.sigAlg,
          hashAlg: firstKey.hashAlg,
          weight: firstKey.weight,
        });
      } catch (error) {
        console.error("Failed to load keys:", error);
        toast({
          title: "Error",
          description: "Failed to load account keys",
          status: "error",
          duration: styles.toastDuration,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }

    loadAccountKeys();
  }, [history, toast]);

  const handleShowPrivateKey = () => {
    setShowPrivateKey(true);
    toast({
      title: "Private Key Revealed",
      description: "Keep your private key secure and never share it!",
      status: "warning",
      duration: 5000,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <Layout
        withGoBack={location && location.state && location.state.withGoBack}
      >
        <Title align="left">Account Keys</Title>
        <Text>Loading...</Text>
      </Layout>
    );
  }

  if (!account || !keys) {
    return (
      <Layout
        withGoBack={location && location.state && location.state.withGoBack}
      >
        <Title align="left">Account Keys</Title>
        <Text>No account or keys found</Text>
      </Layout>
    );
  }

  return (
    <Layout
      withGoBack={location && location.state && location.state.withGoBack}
    >
      <Title align="left">Account Keys</Title>

      <Alert status="warning" mb={4} borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Security Warning!</AlertTitle>
          <AlertDescription fontSize="sm">
            Never share your private key with anyone. Anyone with access to your
            private key can control your funds.
          </AlertDescription>
        </Box>
      </Alert>

      <VStack spacing={6} align="stretch">
        {/* Flow Account Section */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={3}>
            Flow Account
          </Text>

          <VStack spacing={3} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.300">
                Address
              </Text>
              <Code fontSize="xs" p={2} borderRadius="md" wordBreak="break-all">
                {account.address}
              </Code>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.300">
                Public Key
              </Text>
              <HStack>
                <Code
                  fontSize="xs"
                  p={2}
                  borderRadius="md"
                  wordBreak="break-all"
                  flex={1}
                >
                  {keys.publicKey}
                </Code>
                <Button size="sm" onClick={onCopyPublic}>
                  {hasCopiedPublic ? "Copied!" : "Copy"}
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.300">
                Private Key
              </Text>
              {!showPrivateKey ? (
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={handleShowPrivateKey}
                >
                  Reveal Private Key
                </Button>
              ) : (
                <HStack>
                  <Code
                    fontSize="xs"
                    p={2}
                    borderRadius="md"
                    wordBreak="break-all"
                    flex={1}
                  >
                    {keys.privateKey}
                  </Code>
                  <Button size="sm" onClick={onCopyPrivate}>
                    {hasCopiedPrivate ? "Copied!" : "Copy"}
                  </Button>
                </HStack>
              )}
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.300">
                Key Details
              </Text>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs">Key ID: {keys.keyId}</Text>
                <Text fontSize="xs">Signature Algorithm: {keys.sigAlg}</Text>
                <Text fontSize="xs">Hash Algorithm: {keys.hashAlg}</Text>
                <Text fontSize="xs">Weight: {keys.weight}</Text>
              </VStack>
            </Box>
          </VStack>
        </Box>

        <Divider />

        {/* EVM Account Section */}
        {evmAccount && (
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={3}>
              EVM Account
            </Text>
            <VStack spacing={3} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.300">
                  Address
                </Text>
                <HStack>
                  <Code
                    fontSize="xs"
                    p={2}
                    borderRadius="md"
                    wordBreak="break-all"
                    flex={1}
                  >
                    {evmAccount.address}
                  </Code>
                  <Button size="sm" onClick={onCopyEvm}>
                    {hasCopiedEvm ? "Copied!" : "Copy"}
                  </Button>
                </HStack>
              </Box>
            </VStack>
          </Box>
        )}
      </VStack>
    </Layout>
  );
};

export default KeysDisplay;
