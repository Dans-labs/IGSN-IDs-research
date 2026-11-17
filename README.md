# Researching IGSN IDs


## contents

* [overview-IGSN.md](overview-IGSN.md)
* [landscape-analysis.md](landscape-analysis.md)
* [IGNS-explore.ipynb](IGNS-explore.ipynb) - exploring IGSN information and organization through Datacite API
  * produces: [igsn_catalogs_ids.csv](igsn_catalogs_ids.csv) containing some IGSNs per catalog
* [IGSN-DataCite-metadata.ipynb](IGSN-DataCite-metadata.ipynb) 
  * downloads IGSN IDs metadata records listed in, [igsn_catalogs_ids.csv](igsn_catalogs_ids.csv) and stores them in [IGSN-DataCite-metadata/](IGSN-DataCite-metadata/) ie. [IGSN-DataCite-metadata/10.71928/m-202600319-n00016.json](IGSN-DataCite-metadata/10.71928/m-202600319-n00016.json)
* [Datacite Registration Demo](datacite-registration-poc) - Bare bones application that registers IGSNs at Datacite

For jupyternotebooks, install python [requirements.txt](requirements.txt) `pip install -r requirements.txt`

---

Andre Castro, Daan Janssen </br>
(DANS) </br>
2026
