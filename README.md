# ReactoGraph
Reactograph: A graph visualization of Linked Data built with React.js and TypeScript.

This framework is being developed by [Slava Tykhonov](https://orcid.org/0000-0001-9447-9830) from [DANS-KNAW](http://dans.knaw.nl) (Data Archiving and Networked Services, the Netherlands).

# Acknowledgements
ReactoGraph is in active development, please find below the acknowledgements for resources and contributions from the ongoing projects.

Region | Project  | Funding information | Component |
| ------------- | ------------- | ------------- | ------------- |
| Netherlands | [RDA TIGER](https://www.rd-alliance.org/rda-tiger#About%20RDA%20TIGER) | RDA | Graph |

Fill .env with variable pointing to your data API.
Usage:
```
cp .env-sample .env
```
Open and fill in .env your Google Client ID in variable REACT_APP_GOOGLE_CLIENT_ID. Run build and start the application:
```
docker-compose build
docker-compose up -d
```
