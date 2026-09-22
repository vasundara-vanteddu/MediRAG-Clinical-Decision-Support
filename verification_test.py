from evidence.verification import verify_evidence


# -----------------------------
# Positive test
# -----------------------------

positive_results = [
    {"score": 16.0037, "pmid": "42673534"},
    {"score": 15.9588, "pmid": "42669621"},
    {"score": 10.1911, "pmid": "42667746"},
    {"score": 9.2460, "pmid": "42592843"},
    {"score": 7.5069, "pmid": "42653473"},
]

verified, insufficient = verify_evidence(
    positive_results,
    threshold=5.0,
    min_evidence=2
)

print("========================================")
print("POSITIVE EVIDENCE TEST")
print("========================================")

print("Retrieved:", len(positive_results))
print("Verified:", len(verified))
print("Insufficient evidence:", insufficient)

for result in verified:
    print("Score:", result["score"])


# -----------------------------
# Negative test
# -----------------------------

negative_results = [
    {"score": -13.1642, "pmid": "11111111"},
    {"score": -13.2121, "pmid": "22222222"},
    {"score": -14.1151, "pmid": "33333333"},
    {"score": -14.4984, "pmid": "44444444"},
    {"score": -15.0920, "pmid": "55555555"},
]

verified, insufficient = verify_evidence(
    negative_results,
    threshold=5.0,
    min_evidence=2
)

print("\n========================================")
print("NEGATIVE EVIDENCE TEST")
print("========================================")

print("Retrieved:", len(negative_results))
print("Verified:", len(verified))
print("Insufficient evidence:", insufficient)