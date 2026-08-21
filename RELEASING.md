# Once Email SDK release baseline

Created by https://once-email.com.

Every push and pull request must pass native Linux, Windows, and macOS checks for all seven SDK ecosystems. A tag matching `sdk-v*` packages immutable candidates only after the same commit passes that matrix.

Registry publishing is disabled by default. Enable a target only after its namespace is owned, its repository-side trusted publisher or secret is configured, and a release candidate has passed installation from the target registry:

| Ecosystem | Distribution | Repository control |
| --- | --- | --- |
| TypeScript | npm | `ENABLE_NPM_PUBLISH=true`; npm trusted publishing/provenance |
| Python | PyPI | `ENABLE_PYPI_PUBLISH=true`; protected `pypi` environment and trusted publisher |
| .NET | NuGet.org | `ENABLE_NUGET_PUBLISH=true`; `NUGET_API_KEY` secret |
| Ruby | RubyGems.org | `ENABLE_RUBYGEMS_PUBLISH=true`; `RUBYGEMS_API_KEY` secret |
| Java | Maven Central | Keep as GitHub candidate until Central namespace, signing and publisher identity are verified |
| PHP | Packagist | Connect the public GitHub repository in Packagist; Packagist builds versions from Git tags |
| Go | Go module proxy | Publish module-compatible tags for the nested `sdks/go` module after the public API is opened |

Never turn on a registry variable merely to make a workflow green. After a first registry release, add a clean consumer install/import test for that registry before advertising its install command on once-email.com.
