import os
import csv
import json

def get_slugs_from_csv(filename):
    slugs = []
    try:
        with open(filename, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                link = row.get("Link", "")
                if "leetcode.com/problems/" in link:
                    slug = link.split("leetcode.com/problems/")[1].strip("/")
                    slugs.append(slug)
    except Exception:
        pass
    return slugs

def generate_js(data, output_file):
    js_data = json.dumps(data)
    js_template = f"""
async function processAllCompanies() {{
    const data = {js_data};
    const getCookie = (name) => {{
        const value = `; ${{document.cookie}}`;
        const parts = value.split(`; ${{name}}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }};
    
    const csrfToken = getCookie('csrftoken');

    // FIXED: Removed invalid favoriteSlug field
    const getListsQuery = `query allFavorites {{
        favoritesLists {{
            allFavorites {{
                name
                idHash
            }}
        }}
    }}`;

    // FIXED: Reverted to your exact original working mutation
    const createQuery = `mutation createEmptyFavorite($description: String, $favoriteType: FavoriteTypeEnum!, $isPublicFavorite: Boolean = true, $name: String!) {{
        createEmptyFavorite(description: $description, favoriteType: $favoriteType, isPublicFavorite: $isPublicFavorite, name: $name) {{
            ok
            error
            favoriteSlug
        }}
    }}`;

    const addQuery = `mutation batchAddQuestionsToFavorite($favoriteSlug: String!, $questionSlugs: [String]!) {{
        batchAddQuestionsToFavorite(favoriteSlug: $favoriteSlug, questionSlugs: $questionSlugs) {{
            ok
            error
        }}
    }}`;

    let existingLists = {{}};
    try {{
        const fetchRes = await fetch("https://leetcode.com/graphql/", {{
            method: "POST",
            headers: {{
                "content-type": "application/json",
                "x-csrftoken": csrfToken
            }},
            body: JSON.stringify({{
                operationName: "allFavorites",
                query: getListsQuery
            }})
        }});
        const fetchJson = await fetchRes.json();
        const lists = fetchJson.data?.favoritesLists?.allFavorites || [];
        for (const l of lists) {{
            existingLists[l.name] = l.idHash; // Map existing names to their IDs
        }}
        console.log(`Found ${{Object.keys(existingLists).length}} existing lists.`);
    }} catch (err) {{
        console.error("Could not fetch existing lists:", err);
    }}

    for (const item of data) {{
        if (item.slugs.length === 0) continue;
        let listSlug = existingLists[item.company];

        if (!listSlug) {{
            console.log(`Creating list for ${{item.company}}...`);
            try {{
                const createRes = await fetch("https://leetcode.com/graphql/", {{
                    method: "POST",
                    headers: {{
                        "content-type": "application/json",
                        "x-csrftoken": csrfToken
                    }},
                    body: JSON.stringify({{
                        operationName: "createEmptyFavorite",
                        variables: {{
                            name: item.company,
                            description: "Auto-generated list",
                            favoriteType: "NORMAL",
                            isPublicFavorite: true
                        }},
                        query: createQuery
                    }})
                }});
                const createJson = await createRes.json();
                listSlug = createJson.data?.createEmptyFavorite?.favoriteSlug;
                if (listSlug) {{
                    existingLists[item.company] = listSlug;
                }}
            }} catch (err) {{
                console.error(`Failed to create ${{item.company}}`, err);
            }}
        }} else {{
            console.log(`List ${{item.company}} already exists. Skipping creation...`);
        }}

        if (listSlug) {{
            console.log(`Adding questions to ${{item.company}}...`);
            try {{
                await fetch("https://leetcode.com/graphql/", {{
                    method: "POST",
                    headers: {{
                        "content-type": "application/json",
                        "x-csrftoken": csrfToken
                    }},
                    body: JSON.stringify({{
                        operationName: "batchAddQuestionsToFavorite",
                        variables: {{
                            favoriteSlug: listSlug,
                            questionSlugs: item.slugs
                        }},
                        query: addQuery
                    }})
                }});
                console.log(`%cSuccess for ${{item.company}}!`, "color: green");
            }} catch (err) {{
                console.error(`Failed to add questions to ${{item.company}}`, err);
            }}
        }}
        
        // 2 second delay to prevent rate limits
        await new Promise(r => setTimeout(r, 2000));
    }}
    console.log("%cAll companies processed successfully!", "color: blue; font-size: 16px; font-weight: bold;");
}}
processAllCompanies();
"""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_template.strip())

def main():
    base_dir = input("Enter the path to the main repository folder (or '.' for current directory): ").strip()
    if not os.path.isdir(base_dir):
        print("Invalid directory.")
        return

    seen_slugs = set()
    unique_companies_data = []
    all_companies_data = []

    for item in os.listdir(base_dir):
        company_path = os.path.join(base_dir, item)
        if os.path.isdir(company_path):
            csv_path = os.path.join(company_path, "5. All.csv")
            if os.path.exists(csv_path):
                raw_slugs = get_slugs_from_csv(csv_path)
                
                unique_slugs = []
                for s in raw_slugs:
                    if s not in seen_slugs:
                        unique_slugs.append(s)
                        seen_slugs.add(s)
                if unique_slugs:
                    unique_companies_data.append({
                        "company": item,
                        "slugs": unique_slugs
                    })
                
                company_all_slugs = []
                company_seen = set()
                for s in raw_slugs:
                    if s not in company_seen:
                        company_all_slugs.append(s)
                        company_seen.add(s)
                if company_all_slugs:
                    all_companies_data.append({
                        "company": item,
                        "slugs": company_all_slugs
                    })

    if unique_companies_data:
        generate_js(unique_companies_data, "master_console_unique.js")
    
    if all_companies_data:
        generate_js(all_companies_data, "master_console_all.js")
        
    print("Both scripts generated successfully!")

if __name__ == "__main__":
    main()