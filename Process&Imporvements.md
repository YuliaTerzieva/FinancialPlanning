# Goal : 
Simple frontend where I can insert the numbers and make the calculation

### step 1 is to create fields where users can add the following parameters :
- Tax on income from stocks (decimal, e.g. 0.1 is 10%, 0.02 is 2%)
- Expected Annual Expence (the moeny you will be comfortable to live with)

- Expected sustained returned on which to live off (decimal, e.g. 0.1 is 10%, 0.02 is 2%)

- Monthly investment
- Extected annual return (decimal, e.g. 0.1 is 10%, 0.02 is 2%)
- Starting balance

### Step 2 is processing those numbers to get the output 
### Step 3 is to present a plot with portfolio growth 
### Step 4 is to add information

## Design

Everything centered, nice mild colors
Additional information on the formulas used and the approach. 


# How to run this / How i started this

Step 1 is to create a ```package.json``` file with an empty ```{}``` in it.  Then run 
```bash
npm install react@latest react-dom@latest next@latest   
```

Then I created a ```app/``` folder with a simple ```page.js``` file in it. I then added the following to the package.json file :

```bash
"scripts": {
    "dev": "next dev"
  },
```

```bash
npm run dev
```

# To improve

1. Add inflation as an option to be changed. 
2. Ask Nik to double check the math :D
3. Get feedback and improve the logic section, it is not very clear what is what :D