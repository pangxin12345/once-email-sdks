import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPOSITORY = ROOT.parent

class ContractTests(unittest.TestCase):
    def test_generated_contract_matches_single_openapi_source(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "generated_contract.py"
            subprocess.run([sys.executable, str(ROOT / "scripts/generate_contract.py"),
                            "--source", str(REPOSITORY.parent / "spec/openapi.json"),
                            "--output", str(output)], check=True)
            self.assertEqual(output.read_bytes(), (ROOT / "src/once_email/generated_contract.py").read_bytes())

if __name__ == "__main__": unittest.main()
