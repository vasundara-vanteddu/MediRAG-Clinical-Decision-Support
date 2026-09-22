from retrieval.reranked_retrieval import retrieve_and_rerank
from evidence.verification import verify_evidence
from generation.llm import generate_grounded_answer
from citations.citation_builder import build_citations


class MediRAGPipeline:
    """
    Central MediSphere AI pipeline.

    Query
      ↓
    Hybrid Retrieval
      ↓
    RRF
      ↓
    MedCPT Reranking
      ↓
    Evidence Verification
      ↓
    Qwen Generation via llama.cpp
      ↓
    Citation Builder
    """

    def __init__(
        self,
        bm25,
        query_tokenizer,
        query_model,
        faiss_index,
        reranker_tokenizer,
        reranker_model,
        corpus,
        device,
        candidate_k=10,
        top_k=5,
        evidence_threshold=5.0,
        min_evidence=2
    ):
        # ------------------------------------------
        # Retrieval components
        # ------------------------------------------

        self.bm25 = bm25
        self.query_tokenizer = query_tokenizer
        self.query_model = query_model
        self.faiss_index = faiss_index

        # ------------------------------------------
        # Reranking components
        # ------------------------------------------

        self.reranker_tokenizer = reranker_tokenizer
        self.reranker_model = reranker_model

        # ------------------------------------------
        # Corpus + device
        # ------------------------------------------

        self.corpus = corpus
        self.device = device

        # ------------------------------------------
        # Retrieval configuration
        # ------------------------------------------

        self.candidate_k = candidate_k
        self.top_k = top_k

        # ------------------------------------------
        # Evidence verification configuration
        # ------------------------------------------

        self.evidence_threshold = evidence_threshold
        self.min_evidence = min_evidence

    def query(self, question):
        """
        Process a medical question through the
        complete MediSphere pipeline.
        """

        # ------------------------------------------
        # 1. Retrieval + reranking
        # ------------------------------------------

        results = retrieve_and_rerank(
            query=question,
            bm25=self.bm25,
            query_tokenizer=self.query_tokenizer,
            query_model=self.query_model,
            faiss_index=self.faiss_index,
            reranker_tokenizer=self.reranker_tokenizer,
            reranker_model=self.reranker_model,
            corpus=self.corpus,
            device=self.device,
            candidate_k=self.candidate_k,
            top_k=self.top_k
        )

        # ------------------------------------------
        # 2. Evidence verification
        # ------------------------------------------

        verified_results, insufficient_evidence = verify_evidence(
            results,
            threshold=self.evidence_threshold,
            min_evidence=self.min_evidence
        )

        # ------------------------------------------
        # 3. Stop if evidence is insufficient
        # ------------------------------------------

        if insufficient_evidence:
            return {
                "answer": (
                    "Insufficient evidence in the "
                    "retrieved sources."
                ),
                "citations": [],
                "insufficient_evidence": True
            }

        # ------------------------------------------
        # 4. Grounded Qwen generation
        # ------------------------------------------

        answer = generate_grounded_answer(
            query=question,
            evidence_results=verified_results,
            max_new_tokens=400
        )

        # ------------------------------------------
        # 5. Deterministic citations
        # ------------------------------------------

        citations = build_citations(
            verified_results
        )

        # ------------------------------------------
        # 6. Final response
        # ------------------------------------------

        return {
            "answer": answer,
            "citations": citations,
            "insufficient_evidence": False
        }