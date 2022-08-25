# Latest Audit Results

```
  Buyable
    onlyOwner protection
      ✔ protects write function (72ms)
      ✔ protects erase function (42ms)
      ✔ protects the changeData function (70ms)
      ✔ protects transferOwnership function
      ✔ protects the sellContract function
      ✔ protects the endSale function
      ✔ protects the renounceOwnership function
    originalOwner protection
      ✔ protects the setFee function
    intended functionality
      ✔ owner can call write function (52ms)
      ✔ owner can call sellContract
      ✔ buyer cannot buy for incorrect price
      ✔ owner cannot list for under 100 Wei
      ✔ buyer can buy for correct price (67ms)
      ✔ transfers ownership to buyer (50ms)
    after contract purchase
      ✔ protects write from old owner
      ✔ protects erase from old owner
      ✔ protects changeData from old owner
      ✔ protects transferOwnership from old owner
      ✔ protects the sellContract from old owner
      ✔ protects the endSale from old owner
      ✔ protects the renounceOwnership from old owner
      ✔ new owner can call write function
      ✔ new owner can call sellContract


  23 passing (3s)
```
