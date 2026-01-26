import React, { useState } from 'react';
import { fuzzyMatch } from '../utils';
import FuzzySearchDropdown from '../FuzzySearchDropdown';
import FamilyTree from '../FamilyTree';
import DescendantsTree from '../DescendantsTree';
//
// --- Breed and EMS Color options (complex) ---
// All FIFe-recognized breeds and EMS color codes, plus "Other"
const breedOptions = [
  { value: '', label: 'Select breed' },
  { value: 'ABY', label: 'Abyssinian' },
  { value: 'ACL', label: 'American Curl Longhair' },
  { value: 'ACS', label: 'American Curl Shorthair' },
  { value: 'AHL', label: 'American Highlander Longhair' },
  { value: 'AHS', label: 'American Highlander Shorthair' },
  { value: 'ALH', label: 'Asian Longhair (Tiffanie)' },
  { value: 'AMB', label: 'American Bobtail' },
  { value: 'AMW', label: 'American Wirehair' },
  { value: 'AMS', label: 'American Shorthair' },
  { value: 'ASH', label: 'Asian Shorthair' },
  { value: 'AUM', label: 'Australian Mist' },
  { value: 'BAL', label: 'Balinese' },
  { value: 'BAS', label: 'Bashkir Curly' },
  { value: 'BEN', label: 'Bengal' },
  { value: 'BML', label: 'Burmilla' },
  { value: 'BLH', label: 'British Longhair' },
  { value: 'BOM', label: 'Bombay' },
  { value: 'BRI', label: 'British Shorthair' },
  { value: 'BUR', label: 'Burmese' },
  { value: 'BSH', label: 'British Shorthair (duplicate code)' },
  { value: 'CHA', label: 'Chartreux' },
  { value: 'CYM', label: 'Cymric' },
  { value: 'CRX', label: 'Cornish Rex' },
  { value: 'CSH', label: 'Canadian Sphynx' },
  { value: 'DRX', label: 'Devon Rex' },
  { value: 'DSP', label: 'Don Sphynx' },
  { value: 'EUR', label: 'European Shorthair' },
  { value: 'EXO', label: 'Exotic Shorthair' },
  { value: 'GRX', label: 'German Rex' },
  { value: 'HAV', label: 'Havana Brown' },
  { value: 'JBT', label: 'Japanese Bobtail' },
  { value: 'KBL', label: 'Kurilian Bobtail Longhair' },
  { value: 'KBS', label: 'Kurilian Bobtail Shorthair' },
  { value: 'KOR', label: 'Korat' },
  { value: 'LPL', label: 'LaPerm Longhair' },
  { value: 'LPS', label: 'LaPerm Shorthair' },
  { value: 'MAN', label: 'Manx' },
  { value: 'MAU', label: 'Egyptian Mau' },
  { value: 'MBL', label: 'Mekong Bobtail' },
  { value: 'MCO', label: 'Maine Coon' },
  { value: 'MNL', label: 'Minuet Longhair' },
  { value: 'MNS', label: 'Minuet Shorthair' },
  { value: 'NEB', label: 'Nebelung' },
  { value: 'NFO', label: 'Norwegian Forest Cat' },
  { value: 'OCI', label: 'Ocicat' },
  { value: 'OLH', label: 'Oriental Longhair' },
  { value: 'OSH', label: 'Oriental Shorthair' },
  { value: 'PER', label: 'Persian' },
  { value: 'PEB', label: 'Peterbald' },
  { value: 'PIX', label: 'Pixiebob' },
  { value: 'RAG', label: 'Ragdoll' },
  { value: 'RUS', label: 'Russian Blue' },
  { value: 'SBI', label: 'Sacred Birman' },
  { value: 'SCO', label: 'Scottish Fold' },
  { value: 'SFL', label: 'Scottish Fold Longhair' },
  { value: 'SFS', label: 'Scottish Fold Shorthair' },
  { value: 'SIA', label: 'Siamese' },
  { value: 'SIB', label: 'Siberian' },
  { value: 'SIN', label: 'Singapura' },
  { value: 'SKY', label: 'Skookum' },
  { value: 'SNO', label: 'Snowshoe' },
  { value: 'SOK', label: 'Sokoke' },
  { value: 'SOM', label: 'Somali' },
  { value: 'SPH', label: 'Sphynx' },
  { value: 'SRL', label: 'Selkirk Rex Longhair' },
  { value: 'SRS', label: 'Selkirk Rex Shorthair' },
  { value: 'SRX', label: 'Selkirk Rex' },
  { value: 'SUP', label: 'Suphalak' },
  { value: 'SYO', label: 'Seychellois' },
  { value: 'TUA', label: 'Turkish Angora' },
  { value: 'TUV', label: 'Turkish Van' },
  { value: 'THA', label: 'Thai' },
  { value: 'TIF', label: 'Tiffanie' },
  { value: 'TON', label: 'Tonkinese' },
  { value: 'TOS', label: 'Tonkinese (duplicate code)' },
  { value: 'TOY', label: 'Toyger' },
  { value: 'VAN', label: 'Van' },
  { value: 'Other', label: 'Other (specify in notes)' }
];

const emsColorOptions = [
  { value: '', label: 'Select EMS color' },
  { value: 'n', label: 'Black' },
  { value: 'a', label: 'Blue' },
  { value: 'b', label: 'Chocolate' },
  { value: 'c', label: 'Lilac' },
  { value: 'd', label: 'Red' },
  { value: 'e', label: 'Cream' },
  { value: 'f', label: 'Tortie' },
  { value: 'g', label: 'Blue Tortie' },
  { value: 'h', label: 'Chocolate Tortie' },
  { value: 'j', label: 'Lilac Tortie' },
  { value: 'o', label: 'Cinnamon' },
  { value: 'p', label: 'Fawn' },
  { value: 'q', label: 'Cinnamon Tortie' },
  { value: 'r', label: 'Fawn Tortie' },
  { value: 's', label: 'Silver' },
  { value: 'w', label: 'White' },
  { value: 't', label: 'Tabby' },
  { value: 'y', label: 'Golden' },
  { value: 'm', label: 'Caramel' },
  { value: 'w 61', label: 'White (blue eyes)' },
  { value: 'w 62', label: 'White (orange eyes)' },
  { value: 'w 63', label: 'White (odd eyes)' },
  { value: 'ds', label: 'Amber' },
  { value: 'as', label: 'Blue Silver' },
  { value: 'bs', label: 'Chocolate Silver' },
  { value: 'cs', label: 'Lilac Silver' },
  { value: 'ds', label: 'Red Silver' },
  { value: 'es', label: 'Cream Silver' },
  { value: 'fs', label: 'Tortie Silver' },
  { value: 'gs', label: 'Blue Tortie Silver' },
  { value: 'hs', label: 'Chocolate Tortie Silver' },
  { value: 'js', label: 'Lilac Tortie Silver' },
  { value: 'os', label: 'Cinnamon Silver' },
  { value: 'ps', label: 'Fawn Silver' },
  { value: 'qs', label: 'Cinnamon Tortie Silver' },
  { value: 'rs', label: 'Fawn Tortie Silver' },
  { value: 'ns', label: 'Black Silver' },
  { value: 'ny', label: 'Black Golden' },
  { value: 'ay', label: 'Blue Golden' },
  { value: 'by', label: 'Chocolate Golden' },
  { value: 'cy', label: 'Lilac Golden' },
  { value: 'dy', label: 'Red Golden' },
  { value: 'ey', label: 'Cream Golden' },
  { value: 'fy', label: 'Tortie Golden' },
  { value: 'gy', label: 'Blue Tortie Golden' },
  { value: 'hy', label: 'Chocolate Tortie Golden' },
  { value: 'jy', label: 'Lilac Tortie Golden' },
  { value: 'oy', label: 'Cinnamon Golden' },
  { value: 'py', label: 'Fawn Golden' },
  { value: 'qy', label: 'Cinnamon Tortie Golden' },
  { value: 'ry', label: 'Fawn Tortie Golden' },
  { value: 'ns 11', label: 'Black Silver Shaded' },
  { value: 'ns 12', label: 'Black Silver Shell' },
  { value: 'ny 11', label: 'Black Golden Shaded' },
  { value: 'ny 12', label: 'Black Golden Shell' },
  { value: 'as 11', label: 'Blue Silver Shaded' },
  { value: 'as 12', label: 'Blue Silver Shell' },
  { value: 'ay 11', label: 'Blue Golden Shaded' },
  { value: 'ay 12', label: 'Blue Golden Shell' },
  { value: 'bs 11', label: 'Chocolate Silver Shaded' },
  { value: 'bs 12', label: 'Chocolate Silver Shell' },
  { value: 'by 11', label: 'Chocolate Golden Shaded' },
  { value: 'by 12', label: 'Chocolate Golden Shell' },
  { value: 'cs 11', label: 'Lilac Silver Shaded' },
  { value: 'cs 12', label: 'Lilac Silver Shell' },
  { value: 'cy 11', label: 'Lilac Golden Shaded' },
  { value: 'cy 12', label: 'Lilac Golden Shell' },
  { value: 'os 11', label: 'Cinnamon Silver Shaded' },
  { value: 'os 12', label: 'Cinnamon Silver Shell' },
  { value: 'oy 11', label: 'Cinnamon Golden Shaded' },
  { value: 'oy 12', label: 'Cinnamon Golden Shell' },
  { value: 'ps 11', label: 'Fawn Silver Shaded' },
  { value: 'ps 12', label: 'Fawn Silver Shell' },
  { value: 'py 11', label: 'Fawn Golden Shaded' },
  { value: 'py 12', label: 'Fawn Golden Shell' },
  { value: 'ns 21', label: 'Black Silver Tabby' },
  { value: 'as 21', label: 'Blue Silver Tabby' },
  { value: 'bs 21', label: 'Chocolate Silver Tabby' },
  { value: 'cs 21', label: 'Lilac Silver Tabby' },
  { value: 'os 21', label: 'Cinnamon Silver Tabby' },
  { value: 'ps 21', label: 'Fawn Silver Tabby' },
  { value: 'ny 21', label: 'Black Golden Tabby' },
  { value: 'ay 21', label: 'Blue Golden Tabby' },
  { value: 'by 21', label: 'Chocolate Golden Tabby' },
  { value: 'cy 21', label: 'Lilac Golden Tabby' },
  { value: 'oy 21', label: 'Cinnamon Golden Tabby' },
  { value: 'py 21', label: 'Fawn Golden Tabby' },
  { value: 'w 64', label: 'White (green eyes)' },
  { value: 'w 65', label: 'White (aqua eyes)' },
  { value: 'w 66', label: 'White (hazel eyes)' },
  { value: 'w 67', label: 'White (yellow eyes)' },
  { value: 'w 68', label: 'White (copper eyes)' },
  { value: 'w 69', label: 'White (odd eyes, blue & yellow)' },
  { value: 'w 70', label: 'White (odd eyes, blue & green)' },
  { value: 'w 71', label: 'White (odd eyes, blue & copper)' },
  { value: 'w 72', label: 'White (odd eyes, blue & orange)' },
  { value: 'w 73', label: 'White (odd eyes, blue & hazel)' },
  { value: 'w 74', label: 'White (odd eyes, blue & aqua)' },
  { value: 'w 75', label: 'White (odd eyes, blue & amber)' },
  { value: 'w 76', label: 'White (odd eyes, blue & greenish)' },
  { value: 'w 77', label: 'White (odd eyes, blue & golden)' },
  { value: 'w 78', label: 'White (odd eyes, blue & brown)' },
  { value: 'w 79', label: 'White (odd eyes, blue & grey)' },
  { value: 'w 80', label: 'White (odd eyes, blue & unknown)' },
  { value: 'Other', label: 'Other (specify in notes)' }
];

// --- Country code options ---
// All ISO 3166-1 alpha-2 country codes (selected major countries + Other)
const countryCodeOptions = [
  { value: '', label: 'Select country' },
  { value: 'AF', label: 'Afghanistan' },
  { value: 'AX', label: 'Åland Islands' },
  { value: 'AL', label: 'Albania' },
  { value: 'DZ', label: 'Algeria' },
  { value: 'AS', label: 'American Samoa' },
  { value: 'AD', label: 'Andorra' },
  { value: 'AO', label: 'Angola' },
  { value: 'AI', label: 'Anguilla' },
  { value: 'AQ', label: 'Antarctica' },
  { value: 'AG', label: 'Antigua and Barbuda' },
  { value: 'AR', label: 'Argentina' },
  { value: 'AM', label: 'Armenia' },
  { value: 'AW', label: 'Aruba' },
  { value: 'AU', label: 'Australia' },
  { value: 'AT', label: 'Austria' },
  { value: 'AZ', label: 'Azerbaijan' },
  { value: 'BS', label: 'Bahamas' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'BB', label: 'Barbados' },
  { value: 'BY', label: 'Belarus' },
  { value: 'BE', label: 'Belgium' },
  { value: 'BZ', label: 'Belize' },
  { value: 'BJ', label: 'Benin' },
  { value: 'BM', label: 'Bermuda' },
  { value: 'BT', label: 'Bhutan' },
  { value: 'BO', label: 'Bolivia' },
  { value: 'BQ', label: 'Bonaire, Sint Eustatius and Saba' },
  { value: 'BA', label: 'Bosnia and Herzegovina' },
  { value: 'BW', label: 'Botswana' },
  { value: 'BV', label: 'Bouvet Island' },
  { value: 'BR', label: 'Brazil' },
  { value: 'IO', label: 'British Indian Ocean Territory' },
  { value: 'BN', label: 'Brunei Darussalam' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'BI', label: 'Burundi' },
  { value: 'KH', label: 'Cambodia' },
  { value: 'CM', label: 'Cameroon' },
  { value: 'CA', label: 'Canada' },
  { value: 'CV', label: 'Cape Verde' },
  { value: 'KY', label: 'Cayman Islands' },
  { value: 'CF', label: 'Central African Republic' },
  { value: 'TD', label: 'Chad' },
  { value: 'CL', label: 'Chile' },
  { value: 'CN', label: 'China' },
  { value: 'CX', label: 'Christmas Island' },
  { value: 'CC', label: 'Cocos (Keeling) Islands' },
  { value: 'CO', label: 'Colombia' },
  { value: 'KM', label: 'Comoros' },
  { value: 'CG', label: 'Congo' },
  { value: 'CD', label: 'Congo, Democratic Republic of the' },
  { value: 'CK', label: 'Cook Islands' },
  { value: 'CR', label: 'Costa Rica' },
  { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'HR', label: 'Croatia' },
  { value: 'CU', label: 'Cuba' },
  { value: 'CW', label: 'Curaçao' },
  { value: 'CY', label: 'Cyprus' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'DK', label: 'Denmark' },
  { value: 'DJ', label: 'Djibouti' },
  { value: 'DM', label: 'Dominica' },
  { value: 'DO', label: 'Dominican Republic' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'EG', label: 'Egypt' },
  { value: 'SV', label: 'El Salvador' },
  { value: 'GQ', label: 'Equatorial Guinea' },
  { value: 'ER', label: 'Eritrea' },
  { value: 'EE', label: 'Estonia' },
  { value: 'ET', label: 'Ethiopia' },
  { value: 'FK', label: 'Falkland Islands (Malvinas)' },
  { value: 'FO', label: 'Faroe Islands' },
  { value: 'FJ', label: 'Fiji' },
  { value: 'FI', label: 'Finland' },
  { value: 'FR', label: 'France' },
  { value: 'GF', label: 'French Guiana' },
  { value: 'PF', label: 'French Polynesia' },
  { value: 'TF', label: 'French Southern Territories' },
  { value: 'GA', label: 'Gabon' },
  { value: 'GM', label: 'Gambia' },
  { value: 'GE', label: 'Georgia' },
  { value: 'DE', label: 'Germany' },
  { value: 'GH', label: 'Ghana' },
  { value: 'GI', label: 'Gibraltar' },
  { value: 'GR', label: 'Greece' },
  { value: 'GL', label: 'Greenland' },
  { value: 'GD', label: 'Grenada' },
  { value: 'GP', label: 'Guadeloupe' },
  { value: 'GU', label: 'Guam' },
  { value: 'GT', label: 'Guatemala' },
  { value: 'GG', label: 'Guernsey' },
  { value: 'GN', label: 'Guinea' },
  { value: 'GW', label: 'Guinea-Bissau' },
  { value: 'GY', label: 'Guyana' },
  { value: 'HT', label: 'Haiti' },
  { value: 'HM', label: 'Heard Island and McDonald Islands' },
  { value: 'VA', label: 'Holy See (Vatican City State)' },
  { value: 'HN', label: 'Honduras' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'HU', label: 'Hungary' },
  { value: 'IS', label: 'Iceland' },
  { value: 'IN', label: 'India' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'IR', label: 'Iran, Islamic Republic of' },
  { value: 'IQ', label: 'Iraq' },
  { value: 'IE', label: 'Ireland' },
  { value: 'IM', label: 'Isle of Man' },
  { value: 'IL', label: 'Israel' },
  { value: 'IT', label: 'Italy' },
  { value: 'JM', label: 'Jamaica' },
  { value: 'JP', label: 'Japan' },
  { value: 'JE', label: 'Jersey' },
  { value: 'JO', label: 'Jordan' },
  { value: 'KZ', label: 'Kazakhstan' },
  { value: 'KE', label: 'Kenya' },
  { value: 'KI', label: 'Kiribati' },
  { value: 'KP', label: "Korea, Democratic People's Republic of" },
  { value: 'KR', label: 'South Korea' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'KG', label: 'Kyrgyzstan' },
  { value: 'LA', label: "Lao People's Democratic Republic" },
  { value: 'LV', label: 'Latvia' },
  { value: 'LB', label: 'Lebanon' },
  { value: 'LS', label: 'Lesotho' },
  { value: 'LR', label: 'Liberia' },
  { value: 'LY', label: 'Libya' },
  { value: 'LI', label: 'Liechtenstein' },
  { value: 'LT', label: 'Lithuania' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'MO', label: 'Macao' },
  { value: 'MK', label: 'North Macedonia' },
  { value: 'MG', label: 'Madagascar' },
  { value: 'MW', label: 'Malawi' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'MV', label: 'Maldives' },
  { value: 'ML', label: 'Mali' },
  { value: 'MT', label: 'Malta' },
  { value: 'MH', label: 'Marshall Islands' },
  { value: 'MQ', label: 'Martinique' },
  { value: 'MR', label: 'Mauritania' },
  { value: 'MU', label: 'Mauritius' },
  { value: 'YT', label: 'Mayotte' },
  { value: 'MX', label: 'Mexico' },
  { value: 'FM', label: 'Micronesia, Federated States of' },
  { value: 'MD', label: 'Moldova' },
  { value: 'MC', label: 'Monaco' },
  { value: 'MN', label: 'Mongolia' },
  { value: 'ME', label: 'Montenegro' },
  { value: 'MS', label: 'Montserrat' },
  { value: 'MA', label: 'Morocco' },
  { value: 'MZ', label: 'Mozambique' },
  { value: 'MM', label: 'Myanmar' },
  { value: 'NA', label: 'Namibia' },
  { value: 'NR', label: 'Nauru' },
  { value: 'NP', label: 'Nepal' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'NC', label: 'New Caledonia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'NI', label: 'Nicaragua' },
  { value: 'NE', label: 'Niger' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'NU', label: 'Niue' },
  { value: 'NF', label: 'Norfolk Island' },
  { value: 'MP', label: 'Northern Mariana Islands' },
  { value: 'NO', label: 'Norway' },
  { value: 'OM', label: 'Oman' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'PW', label: 'Palau' },
  { value: 'PS', label: 'Palestine, State of' },
  { value: 'PA', label: 'Panama' },
  { value: 'PG', label: 'Papua New Guinea' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'PE', label: 'Peru' },
  { value: 'PH', label: 'Philippines' },
  { value: 'PN', label: 'Pitcairn' },
  { value: 'PL', label: 'Poland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'QA', label: 'Qatar' },
  { value: 'RE', label: 'Réunion' },
  { value: 'RO', label: 'Romania' },
  { value: 'RU', label: 'Russia' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'BL', label: 'Saint Barthélemy' },
  { value: 'SH', label: 'Saint Helena, Ascension and Tristan da Cunha' },
  { value: 'KN', label: 'Saint Kitts and Nevis' },
  { value: 'LC', label: 'Saint Lucia' },
  { value: 'MF', label: 'Saint Martin (French part)' },
  { value: 'PM', label: 'Saint Pierre and Miquelon' },
  { value: 'VC', label: 'Saint Vincent and the Grenadines' },
  { value: 'WS', label: 'Samoa' },
  { value: 'SM', label: 'San Marino' },
  { value: 'ST', label: 'Sao Tome and Principe' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'SN', label: 'Senegal' },
  { value: 'RS', label: 'Serbia' },
  { value: 'SC', label: 'Seychelles' },
  { value: 'SL', label: 'Sierra Leone' },
  { value: 'SG', label: 'Singapore' },
  { value: 'SX', label: 'Sint Maarten (Dutch part)' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'SB', label: 'Solomon Islands' },
  { value: 'SO', label: 'Somalia' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'GS', label: 'South Georgia and the South Sandwich Islands' },
  { value: 'SS', label: 'South Sudan' },
  { value: 'ES', label: 'Spain' },
  { value: 'LK', label: 'Sri Lanka' },
  { value: 'SD', label: 'Sudan' },
  { value: 'SR', label: 'Suriname' },
  { value: 'SJ', label: 'Svalbard and Jan Mayen' },
  { value: 'SZ', label: 'Swaziland' },
  { value: 'SE', label: 'Sweden' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'SY', label: 'Syrian Arab Republic' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'TJ', label: 'Tajikistan' },
  { value: 'TZ', label: 'Tanzania, United Republic of' },
  { value: 'TH', label: 'Thailand' },
  { value: 'TL', label: 'Timor-Leste' },
  { value: 'TG', label: 'Togo' },
  { value: 'TK', label: 'Tokelau' },
  { value: 'TO', label: 'Tonga' },
  { value: 'TT', label: 'Trinidad and Tobago' },
  { value: 'TN', label: 'Tunisia' },
  { value: 'TR', label: 'Turkey' },
  { value: 'TM', label: 'Turkmenistan' },
  { value: 'TC', label: 'Turks and Caicos Islands' },
  { value: 'TV', label: 'Tuvalu' },
  { value: 'UG', label: 'Uganda' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'UM', label: 'United States Minor Outlying Islands' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'UZ', label: 'Uzbekistan' },
  { value: 'VU', label: 'Vanuatu' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'VG', label: 'Virgin Islands, British' },
  { value: 'VI', label: 'Virgin Islands, U.S.' },
  { value: 'WF', label: 'Wallis and Futuna' },
  { value: 'EH', label: 'Western Sahara' },
  { value: 'YE', label: 'Yemen' },
  { value: 'ZM', label: 'Zambia' },
  { value: 'ZW', label: 'Zimbabwe' },
  { value: 'Other', label: 'Other (specify in notes)' }
];

// --- Asset selector stub ---
function AssetSelector({ value, onChange }) {
  // For demonstration, just a file input and preview
  return (
    <div style={{ marginBottom: '10px' }}>
      <input
        type="file"
        accept="image/*"
        onChange={e => {
          if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(ev) {
              onChange(ev.target.result);
            };
            reader.readAsDataURL(e.target.files[0]);
          }
        }}
        style={{ marginBottom: '5px' }}
      />
      {value && (
        <div>
          <img src={value} alt="Cat" style={{ maxWidth: '120px', maxHeight: '120px', border: '1px solid #cbd5e1' }} />
        </div>
      )}
    </div>
  );
}

const CatsSection = ({ cmsData }) => {
  const { catRows, saveCatRows } = cmsData;
  const [editingCatIndex, setEditingCatIndex] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFamilyTree, setShowFamilyTree] = useState(false);
  const [showDescendantsTree, setShowDescendantsTree] = useState(false);

  // For duplicate modal
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState([]);

  const defaultCat = {
    titlesBeforeName: '',
    fullName: '',
    titlesAfterName: '',
    emsColor: '',
    breed: '',
    gender: '',
    dateOfBirth: '',
    geneticTests: '',
    breedingStation: '',
    countryCode: '',
    alternativeName: '',
    printNameLine1: '',
    printNameLine2: '',
    dateOfDeath: '',
    originalRegNo: '',
    lastRegNo: '',
    regNo2: '',
    regNo3: '',
    notes: '',
    breeder: '',
    currentOwner: '',
    countryOfOrigin: '',
    countryOfCurrentResidence: '',
    ownershipNotes: '',
    personalInfo: '',
    dateOfLastOwnershipChange: '',
    sire: '',
    dam: '',
    photo: ''
  };

  const handleAddCat = () => {
    saveCatRows([defaultCat, ...catRows]);
  };

  const handleRemoveCat = (index) => {
    const newRows = catRows.filter((_, i) => i !== index);
    saveCatRows(newRows);
  };

  const handleUpdateCat = (index, field, value) => {
    const newRows = [...catRows];
    newRows[index][field] = value;
    saveCatRows(newRows);
  };

  const handleExpandCat = (index) => {
    setEditingCatIndex(index);
  };

  const handleCloseModal = () => {
    setEditingCatIndex(null);
  };

  const handleDeleteClick = (index) => {
    setCatToDelete(index);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (catToDelete !== null) {
      handleRemoveCat(catToDelete);
      setDeleteModalOpen(false);
      setCatToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setCatToDelete(null);
  };

  // Duplicate check logic
  const handleCheckDuplicates = () => {
    // Find cats with duplicate full names (case-insensitive, trimmed)
    const nameMap = {};
    catRows.forEach((cat, idx) => {
      const name = (cat.fullName || '').trim().toLowerCase();
      if (!name) return;
      if (!nameMap[name]) nameMap[name] = [];
      nameMap[name].push({ ...cat, index: idx });
    });
    const duplicates = Object.values(nameMap).filter(arr => arr.length > 1);
    setDuplicateMatches(duplicates);
    setDuplicateModalOpen(true);
  };

  const handleCloseDuplicateModal = () => {
    setDuplicateModalOpen(false);
    setDuplicateMatches([]);
  };

  const editingCat = editingCatIndex !== null ? catRows[editingCatIndex] : null;

  // Filter cats based on fuzzy search query
  const filteredCatRows = catRows.filter(cat => {
    return (
      fuzzyMatch(cat.fullName || '', searchQuery) ||
      fuzzyMatch(cat.titlesBeforeName || '', searchQuery) ||
      fuzzyMatch(cat.titlesAfterName || '', searchQuery) ||
      fuzzyMatch(cat.breed || '', searchQuery) ||
      fuzzyMatch(cat.emsColor || '', searchQuery)
    );
  });

  if (editingCat) {
    return (
      <section className="main-section active" id="cats-editor">
        <header style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100, borderBottom: '1px solid #e5e7eb' }}>
          <h1>
            <span>Editing cat {editingCat.fullName || '(Unnamed)'}</span>
          </h1>
          <div className="adjustment-buttons">
            <a href="#" onClick={(e) => { e.preventDefault(); setShowFamilyTree(true); }} style={{ marginRight: '10px' }}>Family Tree</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowDescendantsTree(true); }} style={{ marginRight: '10px' }}>Descendants Tree</a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleCloseModal(); }}>← Back to Cats registry</a>
          </div>
        </header>
        <div style={{ padding: '20px', maxWidth: '800px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Photo:</strong>
              <AssetSelector
                value={editingCat.photo || ''}
                onChange={val => handleUpdateCat(editingCatIndex, 'photo', val)}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Titles Before Name:</strong>
              <input
                type="text"
                value={editingCat.titlesBeforeName || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'titlesBeforeName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Full Name: <span style={{ color: '#ef4444' }}>*</span></strong>
              <input
                type="text"
                value={editingCat.fullName || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'fullName', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Titles After Name:</strong>
              <input
                type="text"
                value={editingCat.titlesAfterName || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'titlesAfterName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>EMS Color:</strong>
              <select
                value={editingCat.emsColor || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'emsColor', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              >
                {emsColorOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Breed:</strong>
              <select
                value={editingCat.breed || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'breed', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              >
                {breedOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Gender: <span style={{ color: '#ef4444' }}>*</span></strong>
              <select
                value={editingCat.gender || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'gender', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Sire:</strong>
              <FuzzySearchDropdown
                options={catRows.filter(cat => cat.gender === 'Male')}
                value={editingCat.sire || ''}
                onChange={(value) => handleUpdateCat(editingCatIndex, 'sire', value)}
                placeholder="Select sire"
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Dam:</strong>
              <FuzzySearchDropdown
                options={catRows.filter(cat => cat.gender === 'Female')}
                value={editingCat.dam || ''}
                onChange={(value) => handleUpdateCat(editingCatIndex, 'dam', value)}
                placeholder="Select dam"
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Date of Birth:</strong>
              <input
                type="date"
                value={editingCat.dateOfBirth || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'dateOfBirth', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Genetic Tests:</strong>
              <textarea
                value={editingCat.geneticTests || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'geneticTests', e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Breeding Station:</strong>
              <input
                type="text"
                value={editingCat.breedingStation || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'breedingStation', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Country Code:</strong>
              <select
                value={editingCat.countryCode || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'countryCode', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              >
                {countryCodeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Alternative Name:</strong>
              <input
                type="text"
                value={editingCat.alternativeName || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'alternativeName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Print Name Line 1:</strong>
              <input
                type="text"
                value={editingCat.printNameLine1 || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'printNameLine1', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Print Name Line 2:</strong>
              <input
                type="text"
                value={editingCat.printNameLine2 || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'printNameLine2', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Date of Death:</strong>
              <input
                type="date"
                value={editingCat.dateOfDeath || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'dateOfDeath', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Original Reg No:</strong>
              <input
                type="text"
                value={editingCat.originalRegNo || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'originalRegNo', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Last Reg No:</strong>
              <input
                type="text"
                value={editingCat.lastRegNo || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'lastRegNo', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Reg No 2:</strong>
              <input
                type="text"
                value={editingCat.regNo2 || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'regNo2', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Reg No 3:</strong>
              <input
                type="text"
                value={editingCat.regNo3 || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'regNo3', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Notes:</strong>
              <textarea
                value={editingCat.notes || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'notes', e.target.value)}
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Breeder:</strong>
              <input
                type="text"
                value={editingCat.breeder || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'breeder', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Current Owner:</strong>
              <input
                type="text"
                value={editingCat.currentOwner || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'currentOwner', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Country of Origin:</strong>
              <input
                type="text"
                value={editingCat.countryOfOrigin || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'countryOfOrigin', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Country of Current Residence:</strong>
              <input
                type="text"
                value={editingCat.countryOfCurrentResidence || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'countryOfCurrentResidence', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Ownership Notes:</strong>
              <textarea
                value={editingCat.ownershipNotes || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'ownershipNotes', e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Personal Info:</strong>
              <textarea
                value={editingCat.personalInfo || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'personalInfo', e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Date of Last Ownership Change:</strong>
              <input
                type="date"
                value={editingCat.dateOfLastOwnershipChange || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'dateOfLastOwnershipChange', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
        </div>
        {showFamilyTree && (
          <FamilyTree
            cat={editingCat}
            allCats={catRows}
            onClose={() => setShowFamilyTree(false)}
          />
        )}
        {showDescendantsTree && (
          <DescendantsTree
            cat={editingCat}
            allCats={catRows}
            onClose={() => setShowDescendantsTree(false)}
          />
        )}
      </section>
    );
  }

  return (
    <section className="main-section active" id="cats">
      <header>
        <h1>Cats</h1>
        <div className="adjustment-buttons">
          <input
            type="text"
            placeholder="Search cats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              marginRight: '10px',
              width: '200px'
            }}
          />
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddCat(); }} className="highlighted" style={{ marginRight: '10px' }}>+ Add Cat</a>
          <button
            onClick={handleCheckDuplicates}
            style={{
              padding: '8px 12px',
              backgroundColor: '#fbbf24',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Check Duplicates
          </button>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Titles Before Name</th>
              <th>Full Name <span style={{ color: '#ef4444' }}>*</span></th>
              <th>Titles After Name</th>
              <th>EMS Color</th>
              <th>Breed</th>
              <th>Gender <span style={{ color: '#ef4444' }}>*</span></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCatRows.map((cat, index) => {
              // Find the actual index in the original catRows array
              const actualIndex = catRows.indexOf(cat);
              return (
              <tr key={actualIndex}>
                <td>
                  {cat.photo ? (
                    <img src={cat.photo} alt="Cat" style={{ maxWidth: '60px', maxHeight: '60px', border: '1px solid #cbd5e1' }} />
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.9em' }}>No photo</span>
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    value={cat.titlesBeforeName || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'titlesBeforeName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={cat.fullName || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'fullName', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={cat.titlesAfterName || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'titlesAfterName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                </td>
                <td>
                  <select
                    value={cat.emsColor || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'emsColor', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    {emsColorOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={cat.breed || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'breed', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    {breedOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={cat.gender || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'gender', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => handleExpandCat(actualIndex)} style={{ marginRight: '5px' }}>Expand</button>
                  <button onClick={() => handleDeleteClick(actualIndex)}>Delete</button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {deleteModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.25rem' }}>Confirm Delete</h2>
            <p style={{ marginBottom: '25px', color: '#64748b' }}>
              Are you sure you want to delete this cat entry? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={handleCancelDelete} style={{
                padding: '8px 16px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleConfirmDelete} style={{
                padding: '8px 16px',
                border: 'none',
                backgroundColor: '#ef4444',
                color: 'white',
                cursor: 'pointer'
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {duplicateModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            maxWidth: '600px',
            width: '95%',
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.25rem' }}>Duplicate Full Name Matches</h2>
            {duplicateMatches.length === 0 ? (
              <p style={{ color: '#64748b', marginBottom: '20px' }}>No duplicates found.</p>
            ) : (
              <div>
                {duplicateMatches.map((group, i) => (
                  <div key={i} style={{ marginBottom: '18px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    <strong style={{ color: '#ef4444' }}>{group[0].fullName}</strong>
                    <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
                      {group.map(cat => (
                        <li key={cat.index} style={{ marginBottom: '6px', fontSize: '0.97em' }}>
                          <span style={{ color: '#64748b' }}>Index {cat.index + 1}:</span>
                          {' '}
                          <span>{cat.titlesBeforeName ? cat.titlesBeforeName + ' ' : ''}{cat.fullName}{cat.titlesAfterName ? ' ' + cat.titlesAfterName : ''}</span>
                          {cat.photo && (
                            <img src={cat.photo} alt="Cat" style={{ marginLeft: '8px', maxWidth: '32px', maxHeight: '32px', border: '1px solid #cbd5e1', verticalAlign: 'middle' }} />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                onClick={handleCloseDuplicateModal}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CatsSection;
