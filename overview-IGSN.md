# IGSN & Datacite

## IGSN IDs

>  International Generic Sample Numbers (IGSN IDs) are functionally Digital Object Identifiers (DOIs) with metadata structured according to the DataCite Metadata Schema. [^4]

# IGSN Records     

## IGSN Metadata Schema

IGSN Metadata is divided in 2 layers: 
* PID metadata: uses DataCite metadata Schema and focuses on citation and core discovery of a material sample
* Catalog/repository (custom) metadata focuses on domain-specific discovery and reuse of a material sample  


The most important DataCite PID metadata elements are: [^1]
- ResourceType - "The resourceType property may be populated with resource types from external ontologies or shared vocabularies. In the absence of an agreed vocabulary, the use of the terms “material sample” or “‘feature-of-interest” are strongly recommended"
- resourceTypeGeneral - **resourceTypeGeneral property is “PhysicalObject” for all IGSN IDs.**

Linking to custom metadata: recommendation is to use `relatedIdentifier` property with a `HasMetadata` relationType attribute. 
* for web-hosted metadata file: `relatedIdentifierType` “URL” is appropriate
[^5] see example below:

```xml
     <resourceType resourceTypeGeneral="PhysicalObject"> Material Sample</resourceType>  
    <relatedIdentifiers>  
        <relatedIdentifier relatedIdentifierType="URL" relatedMetadataScheme="Darwin Core Archive" relationType="HasMetadata" schemeType="DwC-A" schemeURI="http://rs.tdwg.org/dwc/terms/guides/text/index.htm"><https://glis.fao.org/glisapi/v1/pgrfas?_format=dwc&doi=10.18730/SSDPA></relatedIdentifier>  
    </relatedIdentifiers>  
```

See also https://support.datacite.org/docs/igsn-id-metadata-recommendations


## Metadata relationships with other PIDs


> Relationships among IGSN IDs and with other resources that use PIDs can be encoded in the DataCite Metadata Schema and represented in the PID Graph
> The `relatedIdentifier` property in the DataCite Metadata Schema can be used to build relationships among IGSN IDs and with other resources that use PIDs. [^2]


## Timeline

- In 2021, the IGSN e.V. and DataCite entered into a strategic partnership and since January 2023 IGSN IDs have been registered as IGSN IDs via DataCite. 
- Until the end of 2022 The IGSN e.V.,manages the IGSN activities and operated the central registration system based on the Handle.Net system (at GFZ) 
- Since 2023, IGSNs are registered as DataCite IGSN IDs (functionally DOIs) [^1]


# IGSN Components

![](https://igsn.uni-kiel.de/documentation/en/_images/igsn_components.svg)

4 key components are involved in a IGSN ID registration, namely:
* **IGSN ID** e.g., 10.58030/kielbot0007007. fundamental identifier. It establishes a crucial link between the sample and its associated metadata and landing page.
* **landing page**: web page that provides descriptive information about the sample and is associated with the IGSN ID. Typically includes a summary of the sample’s characteristics, images, and links to related data and publications. ie. https://jacq.org/detail/1681487 (landing page of 10.58030/kielbot0007007; obtained from [its Datacite metadata record](https://api.datacite.org/application/vnd.datacite.datacite+json/10.58030/kielbot0007007) under property URL )
* **metadata** in Datacite schema, stored in Datacite, accessible in commons ie. https://commons.datacite.org/doi.org/10.58030/kielbot0007007 (same IGSN ID mentioned above) 
* **physical sample object** is associated with an IGSN ID and described by metadata and the landing page.


## IGSN IDs landing page

Examples:
- https://app.geosamples.org/sample/igsn/10.58052/SSH000SUA [10.58052/SSH000SUA in Datacite Commons](https://commons.datacite.org/doi.org/10.58052/ssh000sua)
- https://dataservices.gfz-potsdam.de/igsn/icdp/index.php?igsn=ICDP5054EEW1001 ICDP5054EEW1001 is not a DOI - hence it is not in DataCite Commons




# IGSN Catalogs

- https://dataservices.gfz-potsdam.de/igsn-new/
    - DOES NOT: display full IGSN ID (DOI)
    - DOES NOT: provide machine-readable metadata
- https://www.geosamples.org/
    - sample example: https://app.geosamples.org/sample/igsn/10.58136/UGS0006JB



# References

[^1]: DataCite Support. “IGSN ID Metadata Recommendations.” Accessed February 2, 2026. https://support.datacite.org/docs/igsn-ids.

[^2]: https://support.datacite.org/docs/enriching-igsn-id-metadata-in-the-datacite-metadata-schema#building-relationships-between-igsn-ids-and-other-resources-that-use-pids

[^4]: https://support.datacite.org/docs/harmonizing-datacite-schema-metadata-and-disciplinary-sample-metadata

[^5]: https://support.datacite.org/docs/enriching-igsn-id-metadata-in-the-datacite-metadata-schema#linking-to-custom-metadata
