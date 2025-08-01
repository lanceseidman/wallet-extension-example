// EIP-6963: Announce and respond to provider requests
const announceProvider = () => {
  const providerDetail = {
    info: {
      uuid: "c466544a-427c-4cc0-8e5f-af916e3c983a",
      name: "Flow Wallet",
      icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0zMy4zMzMzIDI1SDUwQzYzLjgwNzEgMjUgNzUgMzYuMTkzOSA3NSA1MEM3NSA2My44MDcxIDYzLjgwNzEgNzUgNTAgNzVIMzMuMzMzM0w1OC4zMzMzIDUwTDQxLjY2NjcgMjVIMzMuMzMzM1oiIGZpbGw9IiMwMEQ0QUUiLz4KPHBhdGggZD0iTTQxLjY2NjcgNzVIMjVWMjVINDkuMTY2N0w0MS42NjY3IDc1WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzM4M18yKSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzM4M18yIiB4MT0iNDMuNzUiIHkxPSI2Mi41IiB4Mj0iMjUiIHkyPSIyNS4wMDAyIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwMEQ0QUUiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNjI3RUVBIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==",
      rdns: "com.onflow.wallet",
    },
    provider: new EIP1193Provider(),
  };

  window.dispatchEvent(
    new CustomEvent("eip6963:announceProvider", { detail: providerDetail })
  );
};

// EIP-1193 Provider
class EIP1193Provider {
  async request({ method, params }) {
    if (method === "eth_requestAccounts") {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: "eth_requestAccounts",
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.accounts);
            }
          }
        );
      });
    }

    // For other methods, you would typically forward them to a node
    // but for this example, we'll just return an error.
    return Promise.reject(new Error("Method not implemented."));
  }
}

// Announce the provider when the script is loaded
announceProvider();

// Listen for requests from the dApp
window.addEventListener("eip6963:requestProvider", () => {
  announceProvider();
});
