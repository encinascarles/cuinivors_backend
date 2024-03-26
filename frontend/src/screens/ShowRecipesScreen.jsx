import { useSelector } from "react-redux";
import { useGetUserRecipesQuery } from "../slices/recipeApiSlice";
import { useEffect, useState } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

const ShowRecipesScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [recipes, setRecipes] = useState([]);
  const { data: recipe, error } = useGetUserRecipesQuery();

  useEffect(() => {
    if (error) {
      console.log("Failed to fetch recipes");
    } else if (recipe) {
      setRecipes(recipe);
      console.log(recipe);
    }
  }, [recipe, error]);

  return (
    <Grid container spacing={2}>
      {recipes.map((recipe) => (
        <Grid item key={recipe._id} xs={12} sm={6} md={4} lg={3}>
          <Link to={`/recipes/${recipe._id}`}>
            <Card>
              <CardActionArea>
                <CardMedia
                  component="img"
                  alt={recipe.name}
                  height="140"
                  image={recipe.image}
                  title={recipe.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {recipe.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
};

export default ShowRecipesScreen;
