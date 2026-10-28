# Reflection — Fugleblikk

## From assignment to hobby project

The open concept of this assignment gave me room to be creative. Fugleblikk grew out of my love for nature, biodiversity and data visualization, developing from a school assignment into a hobby project. My aim was to create a calm, visual and interactive experience. I actually use the mixed bird sounds as background music for some zen time!

## Challenges and decisions

One of the biggest challenges was deciding which birds to include and combining data from different APIs. A bird being listed in a taxonomy does not mean it has been observed in Norway. I used Artskart to find candidate birds from observation records, then Artsnavn to resolve their taxonomy:

- An accepted species → keep its official ID and names.
- A synonym → use the accepted species instead.
- A subspecies → use its parent species.

Placing birds on the globe was another challenge. Observations are unevenly distributed, so using exact coordinates would cause bird images to overlap. I chose a grid layout that minimizes the total distance between the birds and their recorded locations. This makes the collection easier to browse, but some birds appear farther from their observation points.

## What I learned

This was my first time setting up GitHub Actions. I learned how a workflow file runs preparation scripts, uses repository secrets and commits updated data.

Fixing the broken page for "ismåke" helped me understand encoding and decoding. Names containing characters such as “å” need to be handled correctly in links and dynamic routes. 

I also learned some data handling strategies. For example, removing photo backgrounds takes time, so bird cutouts are generated during preparation and saved locally, ready to display. Recordings are already ready to play, so I store their URLs and load the audio when needed. This keeps the repository smaller and avoids managing hundreds of audio files.

## What I would improve

I would improve how the site handles unavailable media and add targeted tests for date ranges, species matching and Norwegian URLs. When external services fail or undergo maintenance, the site should clearly explain why a recording or search is unavailable. In future projects, I would finish and test the core experience before adding extras such as migration playback and mixed sound.
