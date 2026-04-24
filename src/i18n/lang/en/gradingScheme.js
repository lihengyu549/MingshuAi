export default {
  scheme: 'Scheme',
  schemeName: 'Scheme Name',
  addScheme: 'Add Scheme',
  defaultTag: 'Default',
  schemeType: 'Scheme Type',
  customType: 'Custom',
  useCount: 'Usage Count',
  sensitiveDataDefinition: 'Sensitive Data Definition',
  securityLevelAtLeast: 'Security level greater than or equal to',
  sensitiveDataSuffix: 'is defined as sensitive data',
  schemeDetails: 'Scheme Details',
  levelNumber: 'Level Number',
  levelName: 'Level Name',
  levelDefinition: 'Level Definition',
  recommendedProtection: 'Recommended Protection Measures',
  save: 'Save',
  deleteConfirm: 'Are you sure you want to delete this scheme?',
  saved: 'Saved successfully',
  examplePlaceholder: 'Example: Data Security Classification Scheme',
  protectMasking: 'Masking',
  protectEncryption: 'Encryption',
  defaultLevels: {
    level0: {
      name: 'Unclassified',
      definition: 'Data without a defined classification level.'
    },
    level1: {
      name: 'Level 1 - Publicly Disclosable',
      definition: 'Data generally available for public awareness or use. A security incident would have no impact or only minimal impact on personal privacy or lawful business interests, and would not involve risks to national security or public interests.'
    },
    level2: {
      name: 'Level 2 - Internal General',
      definition: 'General business data typically shared only with limited internal management audiences and not suitable for broad disclosure. A security incident may cause minor impact on personal privacy or lawful business interests, but would not affect national security or public interests.'
    },
    level3: {
      name: 'Level 3 - Internal Sensitive',
      definition: 'Key or important business data accessible only to specifically authorized personnel on a need-to-know basis. A security incident may cause minor impact on public interests or relatively significant impact on personal privacy or lawful business interests, but would not affect national security.'
    },
    level4: {
      name: 'Level 4 - Important Sensitive',
      definition: 'Important business data of core node institutions, accessible only to specifically authorized personnel on a need-to-know basis. A security incident may cause general impact on public interests or serious impact on personal privacy or lawful business interests, but would not affect national security.'
    },
    level5: {
      name: 'Level 5 - Core Sensitive',
      definition: 'Critical business data of core node institutions, accessible only to specifically authorized personnel on a need-to-know basis. A security incident would cause serious impact on national security or public interests.'
    }
  }
}
