#!/bin/bash

#We will also save the most recent transaction ID
previous_transaction="2yoLXTXp3WnE8tJRJyw6z9gmeZm96fXV8EWZXz53hgtFb2eNr8SqjjHpfWJ1QxpZu3WjFPnCqaxXzb9aKrdXVdqP"

#Loop to check if balance has changed
while true; do
	#Get the latest transaction we can see on chain
	latest_data=$(curl https://damp-fabled-panorama.solana-mainnet.quiknode.pro/186133957d30cece76e7cd8b04bce0c5795c164e/ \
	-X POST \
	-H "Content-Type: application/json" \
	-d $'[
		{
			"jsonrpc": "2.0",
			"id": 1,
			"method": "getSignaturesForAddress",
			"params": ["crushpRpFZ7r36fNfCMKHFN4SDvc7eyXfHehVu34ecW",{"limit" : 1} ]
		}
	]')
	echo $latest_data
	latest_tx=$(echo $latest_data | jq '.[].result[].signature' )
	latest_tx=${latest_tx//\"/}
	echo "-------------------------"
	echo "Latest TX"
	echo $latest_tx
	echo "-------------------------"

	if [ "$latest_tx" = "$previous_transaction" ]; then
		echo "----------------------------"
 		echo "No new Tx detected, last TX:"
	  	echo $previous_transaction
		echo "----------------------------"
	else
      	#Print message to screen
      	echo "New TX detected, pulling queue and then TXs"	
		echo "getting TXs up till $previous_transaction"
		#Get new transactions
		transaction_data=$(curl https://damp-fabled-panorama.solana-mainnet.quiknode.pro/186133957d30cece76e7cd8b04bce0c5795c164e/ \
		-X POST \
		-H "Content-Type: application/json" \
		-d $'[
			{
				"jsonrpc": "2.0",
				"id": 1,
				"method": "getSignaturesForAddress",
				"params": ["crushpRpFZ7r36fNfCMKHFN4SDvc7eyXfHehVu34ecW",{"until" : "'$previous_transaction'","Commitment" : "Confirmed"} ]
			}
		]')

		#echo $transaction_data

		#Iterate over each transaction in the response
		n=$(echo $transaction_data | jq '.[].result | length')
		#knock one off here for indexing, as refering starts from 0
		n=$((n-1))
		
		while [[ $n -ge 0 ]];do
			signature=$(echo $transaction_data | jq .[].result[$n].signature)
			signature=$(echo $signature | tr -d '"')
			echo $signature

			#here let us pull the signature data quickly so we can parse the signer.
			tx_details=$(curl https://damp-fabled-panorama.solana-mainnet.quiknode.pro/186133957d30cece76e7cd8b04bce0c5795c164e/ \
			-X POST \
			-H "Content-Type: application/json" \
			--data $'[
				{
					"jsonrpc": "2.0",
					"id": 1,
					"method": "getTransaction",
					"params": ["'$signature'",{"encoding": "jsonParsed","maxSupportedTransactionVersion":0}]
				}
			]')
			#signer=$(echo $tx_details | jq .[].result[$n].signature)
			#echo $tx_details > details_$signature.json
			signer=$(echo $tx_details | jq '.[].result.transaction.message.accountKeys[] | select(.signer == true) | .pubkey')
			signer=$(echo $signer | tr -d '"')
			echo $signer

			#Parse memo field from transaction data
			memo_field=$(echo $transaction_data | jq .[].result[$n].memo)
			echo $memo_field
			
			cleaned_memo_field=$(echo $memo_field | cut -d "]" -f2)
			cleaned_memo_field=$(echo $cleaned_memo_field | tr -d '"')
			echo $cleaned_memo_field
			# Split the cleaned_memo_field to extract the seed and moves
			IFS='|' read -r seed moves <<< "$cleaned_memo_field"

			# Pass the seed and moves as separate arguments to the Python script
			python3_output=$(python3 validate.py "$seed" "$moves")
			echo $python3_output
			#seed=			$(echo "$python3_output" | cut -d ',' -f1 | cut -d ':' -f2)
			points=$(echo "$python3_output" | cut -d ',' -f1 | cut -d ':' -f2)
			cards_collected=$(echo "$python3_output" | cut -d ',' -f2 | cut -d ':' -f2)
			echo $cards_collected
			echo $points
			# Log entry
			echo "Signature: $signature, Signer: $signer, Points: $points, Cards Collected: $cards_collected, Seed: $seed" >> transaction_log.txt


			# Read current leaderboard
			leaderboard_file="leaderboard.json"

			# Function to update or create a seed-specific leaderboard
			update_seed_leaderboard() {
				seed_leaderboard_file="leaderboard_${seed}.json"
				if [ ! -f "$seed_leaderboard_file" ]; then
					echo '{"players": []}' > "$seed_leaderboard_file"
				fi

				local entry="{\"signer\":\"$signer\",\"signature\":\"$signature\",\"points\":$points,\"cards_collected\":$cards_collected}"

				# Update the seed-specific leaderboard
				jq --argjson newEntry "$entry" '
					.players |= (. + [$newEntry] | unique_by(.signer) | map(
						if .signer == $newEntry.signer then
							if .points < $newEntry.points then
								$newEntry
							else
								.
							end
						else
							.
						end
					))
				' "$seed_leaderboard_file" > tmp.json && mv tmp.json "$seed_leaderboard_file"
			}

			# Function to update the global leaderboard with every entry
			update_global_leaderboard() {
				local entry="{\"signer\":\"$signer\",\"signature\":\"$signature\",\"points\":$points,\"cards_collected\":$cards_collected,\"seed\":\"$seed\"}"

				# Check if the global leaderboard file exists, if not, create it
				if [ ! -f "$leaderboard_file" ]; then
					echo '{"entries": []}' > "$leaderboard_file"
				fi

				# Add the new entry to the global leaderboard
				jq --argjson newEntry "$entry" '
					.entries |= (. + [$newEntry])
				' "$leaderboard_file" > tmp.json && mv tmp.json "$leaderboard_file"
			}

			# Inside your transaction processing loop, after extracting the seed and moves
			update_seed_leaderboard
			update_global_leaderboard

			shdw-drive edit-file -r https://damp-fabled-panorama.solana-mainnet.quiknode.pro/186133957d30cece76e7cd8b04bce0c5795c164e/ -kp /Users/hogyzen12/.config/solana/6tBou5MHL5aWpDy6cgf3wiwGGK2mR8qs68ujtpaoWrf2.json  -f leaderboard.json -u https://shdw-drive.genesysgo.net/3UgjUKQ1CAeaecg5CWk88q9jGHg8LJg9MAybp4pevtFz/leaderboard.json


			#move to upwards towards most recents
			n=$((n-1))
		done

		#Update most recent transaction ID
		previous_transaction=$latest_tx
		echo "Previous Transaction updated to latest one: $previous_transaction"
    fi

    sleep 15
	
done
