curl -XPUT 'https://search-app-server-ikcfhma3cq4ms4rs6xxnmraoe4.us-west-1.es.amazonaws.com/newmap?pretty' -H 'Content-Type: application/json' -d'
{
    "settings" : {
        "number_of_shards" : 1
    },
    "mappings" : {
        "type1" : {
            "properties" : {
                "testLocation" : { "type" : "geo_point" }
            }
        }
    }
}'

curl -XPUT 'https://search-app-server-ikcfhma3cq4ms4rs6xxnmraoe4.us-west-1.es.amazonaws.com/testmap?pretty' -H 'Content-Type: application/json' -d'
{
    "settings" : {
        "index" : {
            "number_of_shards" : 3,
            "number_of_replicas" : 2
        }
    }
}'

curl -XPUT 'https://search-app-server-ikcfhma3cq4ms4rs6xxnmraoe4.us-west-1.es.amazonaws.com/querytracker?pretty' -H 'Content-Type: application/json' -d'
 {
     "settings" : {
         "number_of_shards" : 1
     },
     "mappings" : {
         "search" : {
             "properties" : {
                 "location" : { "type" : "geo_point" },
                 "time" : {"type" : "date"}
             }
         },
         "logs" : {
             "properties" : {
                 "time" : {"type" : "date"},
                 "success" : {"type" : "boolean"}
             }
         }
     }
}'