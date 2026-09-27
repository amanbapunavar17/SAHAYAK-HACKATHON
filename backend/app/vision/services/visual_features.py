import cv2
import imagehash
import numpy as np
from PIL import Image
from typing import Tuple, Optional

from app.vision.schemas.features import ImageHashes, ORBFeatures
from app.vision.utils.serialization import pack_descriptors, unpack_descriptors
from app.vision.core.config import vision_settings


class VisualFeatureExtractor:
    """Extracts perceptual hashes and ORB keypoint descriptors."""
    def __init__(self, n_features: int = vision_settings.ORB_MAX_FEATURES):
        self.n_features = n_features
        self.orb = cv2.ORB_create(nfeatures=self.n_features)

    def extract_hashes(self, pil_img: Image.Image) -> ImageHashes:
        phash_val = str(imagehash.phash(pil_img))
        dhash_val = str(imagehash.dhash(pil_img))
        ahash_val = str(imagehash.average_hash(pil_img))
        return ImageHashes(phash=phash_val, dhash=dhash_val, ahash=ahash_val)

    def extract_orb(self, cv2_img: np.ndarray) -> Tuple[ORBFeatures, Optional[np.ndarray]]:
        gray = cv2.cvtColor(cv2_img, cv2.COLOR_BGR2GRAY)
        keypoints, descriptors = self.orb.detectAndCompute(gray, None)
        
        kp_count = len(keypoints) if keypoints else 0
        b64_desc = pack_descriptors(descriptors)
        
        return ORBFeatures(keypoint_count=kp_count, descriptors_b64=b64_desc), descriptors

    @staticmethod
    def compute_hash_similarity(h1: ImageHashes, h2: ImageHashes) -> float:
        """Compute normalized similarity [0, 1] from Hamming distances."""
        try:
            p1, p2 = imagehash.hex_to_hash(h1.phash), imagehash.hex_to_hash(h2.phash)
            d1, d2 = imagehash.hex_to_hash(h1.dhash), imagehash.hex_to_hash(h2.dhash)
            a1, a2 = imagehash.hex_to_hash(h1.ahash), imagehash.hex_to_hash(h2.ahash)

            # Max hamming distance for 64-bit hash is 64
            p_sim = max(0.0, 1.0 - (p1 - p2) / 64.0)
            d_sim = max(0.0, 1.0 - (d1 - d2) / 64.0)
            a_sim = max(0.0, 1.0 - (a1 - a2) / 64.0)

            # Weighted hash fusion (pHash gets highest weight)
            return (0.5 * p_sim) + (0.3 * d_sim) + (0.2 * a_sim)
        except Exception:
            return 0.5

    @staticmethod
    def match_orb_descriptors(desc1: Optional[np.ndarray], desc2: Optional[np.ndarray]) -> Tuple[int, float]:
        """
        BFMatcher with NORM_HAMMING + Lowe's ratio test + inlier scoring.
        """
        if desc1 is None or desc2 is None or len(desc1) < 4 or len(desc2) < 4:
            return 0, 0.0

        matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
        try:
            matches = matcher.knnMatch(desc1, desc2, k=2)
            good_matches = []
            for match_pair in matches:
                if len(match_pair) == 2:
                    m, n = match_pair
                    if m.distance < vision_settings.LOWE_RATIO_THRESHOLD * n.distance:
                        good_matches.append(m)

            inlier_count = len(good_matches)
            max_possible = min(len(desc1), len(desc2))
            inlier_ratio = inlier_count / max(1, max_possible)
            
            # Score scaled so 15+ good inliers gives strong match confidence
            score = min(1.0, (inlier_count / 15.0) * 0.7 + inlier_ratio * 0.3)
            return inlier_count, score
        except Exception:
            return 0, 0.0
